import { useState, useCallback } from 'react'
import { useNovel } from '../../store'
import { canNodeAiGenerate, getNodeAiConfig } from '../../lib/node-ai-config'
import { isNodeCompleted } from '../../lib/nodes'

const STEPS = [
  { id: 1, name: '加载上下文' },
  { id: 2, name: 'AI 生成' },
  { id: 3, name: '自动校验' },
  { id: 4, name: '预览确认' },
  { id: 5, name: '锁定写入' },
]

export default function NodeWorkflowPanel({ nodeKey, onClose }) {
  const {
    project,
    meta,
    chapters,
    chapterIdx,
    settings,
    nodeWorkflow,
    runNodeRefineStep,
    commitNodeRefine,
    clearNodeWorkflow,
  } = useNovel()

  const config = getNodeAiConfig(nodeKey)
  const [writeMode, setWriteMode] = useState(config?.writeMode === 'replace' ? 'replace' : 'merge')
  const [chapterTarget, setChapterTarget] = useState(
    () => chapters[chapterIdx]?.id ?? chapters[0]?.id ?? 1
  )
  const [previewJson, setPreviewJson] = useState('')

  const wf = nodeWorkflow?.nodeKey === nodeKey ? nodeWorkflow : null
  const step = wf?.step ?? 0
  const busy = wf?.busy

  const syncPreview = useCallback((data) => {
    if (data === undefined || data === null) {
      setPreviewJson('')
      return
    }
    setPreviewJson(JSON.stringify(data, null, 2))
  }, [])

  if (!nodeKey || !canNodeAiGenerate(nodeKey)) {
    return (
      <div className="node-workflow panel-hint-box">
        <p><strong>{nodeKey}</strong> 请使用下方编辑面板手动完善模型（审计/协同/交付类节点）。</p>
        {onClose && <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>关闭</button>}
      </div>
    )
  }

  const handleLoadContext = async () => {
    const r = await runNodeRefineStep(nodeKey, 'load')
    if (r?.contextMeta) {
      syncPreview(r.context)
    }
  }

  const handleGenerate = async () => {
    const r = await runNodeRefineStep(nodeKey, 'generate', {
      chapterId: chapterTarget,
      count: config?.defaultCount,
    })
    if (r?.data !== undefined) syncPreview(r.data)
  }

  const handleValidate = async () => {
    let data = wf?.generatedData
    if (previewJson.trim()) {
      try {
        data = JSON.parse(previewJson)
      } catch {
        alert('预览 JSON 格式无效，请先修正')
        return
      }
    }
    await runNodeRefineStep(nodeKey, 'validate', { data })
  }

  const handleCommit = async () => {
    let data = wf?.generatedData
    if (previewJson.trim()) {
      try {
        data = JSON.parse(previewJson)
      } catch {
        alert('预览 JSON 格式无效')
        return
      }
    }
    if (!data) {
      alert('请先生成或填写要写入的数据')
      return
    }
    const r = await commitNodeRefine(nodeKey, data, {
      mode: writeMode,
      chapterId: config?.needsChapterTarget ? chapterTarget : undefined,
    })
    if (r?.success) {
      onClose?.()
      clearNodeWorkflow()
    }
  }

  const blockedDeps = (project.phases || [])
    .flatMap(p => p.nodes)
    .find(n => n.nodeKey === nodeKey)
    ?.dependsOn?.filter(dep => !isNodeCompleted(dep, project)) ?? []

  return (
    <div className="node-workflow struct-section">
      <div className="struct-section-header">
        <h3>完善模型 · {config.label} · {nodeKey}</h3>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { clearNodeWorkflow(); onClose?.() }}>
          关闭
        </button>
      </div>

      <p className="panel-hint workflow-intro">
        从当前<strong>已锁定</strong>的上游模型切片生成内容，校验通过后<strong>写入项目 JSON</strong>，并标记节点完成。
        书名：{meta.title}
        {!settings.apiKey && <span className="workflow-warn"> · 未配置 API Key，将使用模拟数据（可在设置中填写）</span>}
      </p>

      {blockedDeps.length > 0 && (
        <p className="panel-hint issue-warn">上游未完成：{blockedDeps.join('、')}，生成结果可能不完整。</p>
      )}

      <div className="workflow-steps">
        {STEPS.map(s => (
          <span key={s.id} className={`workflow-step ${step >= s.id ? 'done' : ''} ${step === s.id ? 'active' : ''}`}>
            {s.id}. {s.name}
          </span>
        ))}
      </div>

      {config.needsChapterTarget && (
        <label className="workflow-target">
          目标章节
          <select
            className="select-input"
            value={chapterTarget}
            onChange={e => setChapterTarget(Number(e.target.value))}
          >
            {chapters.map(ch => (
              <option key={ch.id} value={ch.id}>Ch{ch.id} {ch.title}</option>
            ))}
          </select>
        </label>
      )}

      <div className="workflow-actions">
        <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={handleLoadContext}>
          ① 加载上下文
        </button>
        <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={handleGenerate}>
          ② AI 生成草案
        </button>
        <button type="button" className="btn btn-ghost btn-sm" disabled={busy || !wf?.generatedData} onClick={handleValidate}>
          ③ 校验
        </button>
        <button type="button" className="btn btn-ghost btn-sm" disabled={busy || step < 3} onClick={handleCommit}>
          ⑥ 锁定写入模型
        </button>
      </div>

      {config.writeMode !== 'patchChapter' && (
        <label className="workflow-write-mode">
          写入方式
          <select className="select-input" value={writeMode} onChange={e => setWriteMode(e.target.value)}>
            <option value="merge">合并到现有数据（推荐）</option>
            <option value="replace">替换该模块全部数据</option>
          </select>
        </label>
      )}

      {wf?.contextMeta && (
        <div className="workflow-meta">
          上下文 {wf.contextMeta.size} bytes
          {wf.contextMeta.trimmed && '（已裁剪）'}
        </div>
      )}

      {wf?.logs?.length > 0 && (
        <ul className="workflow-logs">
          {wf.logs.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}

      {(wf?.errors?.length > 0 || wf?.warnings?.length > 0) && (
        <div className="workflow-messages">
          {wf.errors?.map((e, i) => <div key={`e${i}`} className="issue-error">{e}</div>)}
          {wf.warnings?.map((w, i) => <div key={`w${i}`} className="issue-warn">{w}</div>)}
        </div>
      )}

      <label className="workflow-preview-label">
        ④ 生成预览（可编辑 JSON 后写入）
        <textarea
          className="text-input workflow-preview-json"
          rows={12}
          value={previewJson}
          onChange={e => setPreviewJson(e.target.value)}
          placeholder="点击「AI 生成草案」后显示…"
        />
      </label>
    </div>
  )
}
