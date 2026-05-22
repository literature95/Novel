// src/components/content/ContentView.jsx
import { useState } from 'react'
import { useNovel } from '../../store'
import { Badge, Btn, ProgressItem, ConflictBadge, ForeshadowTag, clsx } from '../ui'
import { Check, Sparkles } from 'lucide-react'

// ─── Chapter List ───
function ChapterList() {
  const { chapters, chapterIdx, selectChapter, volumes } = useNovel()
  const [volFilter, setVolFilter] = useState('all')

  const filtered = volFilter === 'all'
    ? chapters
    : chapters.filter(ch => {
        const vol = volumes?.find(v => v.id === volFilter)
        return vol?.chapters?.includes(ch.id)
      })

  return (
    <div className="content-chapters">
      <div className="chapters-header">
        <span>章节列表</span>
        <div className="vol-tabs">
          <span
            className={`vol-tab ${volFilter === 'all' ? 'active' : ''}`}
            onClick={() => setVolFilter('all')}
          >全部</span>
          {(volumes || []).map(v => (
            <span
              key={v.id}
              className={`vol-tab ${volFilter === v.id ? 'active' : ''}`}
              onClick={() => setVolFilter(v.id)}
            >{v.name?.replace(/^第.+册：/, '') || v.id}</span>
          ))}
        </div>
      </div>
      <div className="chapters-list">
        {filtered.map(ch => {
          const i = chapters.findIndex(c => c.id === ch.id)
          const statusColor = { done: 'bg-verdant', progress: 'bg-ochre', locked: 'bg-faded/40' }
          const pct = ch.words > 0 ? Math.round(ch.words / ch.targetWords * 100) + '%' : '—'
          return (
            <div
              key={ch.id}
              onClick={() => selectChapter(i)}
              className={`chapter-item ${i === chapterIdx ? 'active' : ''}`}
            >
              <span className="ch-num">Ch{ch.id}</span>
              <span className="ch-title">{ch.title}</span>
              <span className={`ch-status ${statusColor[ch.status]}`} />
              <span className="ch-progress">{pct}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Scene Tabs ───
function SceneTabs() {
  const { chapter, scenes, scene, sceneIdx, setSceneIdx, generating, generateScene, validation, addScene, deleteScene } = useNovel()

  function showValidation() {
    document.querySelector('.meta-section-title')?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' })
  }

  const handleAddScene = () => {
    if (!chapter) return
    addScene(chapter.id)
  }

  const handleDeleteScene = () => {
    if (!chapter || scenes.length === 0) return
    deleteScene(chapter.id, sceneIdx)
  }

  return (
    <div className="scene-toolbar">
      <div className="scene-tabs">
        {scenes.length === 0
          ? <span className="scene-tab active">暂无场景</span>
          : scenes.map((s, i) => (
            <span key={s.id} onClick={() => setSceneIdx(i)}
              className={`scene-tab ${i === sceneIdx ? 'active' : ''}`}>
              场景{i + 1}
            </span>
          ))
        }
        <button type="button" className="scene-add-btn" onClick={handleAddScene} title="添加场景">+</button>
        {scenes.length > 0 && (
          <button type="button" className="scene-del-btn" onClick={handleDeleteScene} title="删除当前场景">−</button>
        )}
      </div>
      <div className="toolbar-right">
        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          {scene ? scene.content.replace(/\s/g, '').length : 0} 字
        </span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={showValidation}>
          {validation.passed ? '✓ 校验' : `✗ 校验 (${validation.errorCount})`}
        </button>
        <button className="btn btn-primary btn-sm" onClick={generateScene} disabled={generating}>
          {generating ? '生成中...' : '✦ AI 生成场景'}
        </button>
      </div>
    </div>
  )
}

// ─── Scene Content ───
function SceneContent() {
  const { scene, updateSceneContent } = useNovel()

  if (!scene) {
    return (
      <div className="editor-writing">
        <div className="scene-placeholder">
          <div className="text-4xl mb-4 opacity-40">✍️</div>
          <p>本章尚无场景内容</p>
        </div>
      </div>
    )
  }

  return (
    <div className="editor-writing">
      <textarea
        className="scene-editor"
        value={scene.content}
        onChange={e => updateSceneContent(e.target.value)}
        placeholder="在此撰写场景正文…（段落之间空一行）"
        spellCheck={false}
      />
    </div>
  )
}

// ─── Meta Panel ───
function MetaPanel() {
  const { scene, chapter, plotLines, characters, foreshadows, validation } = useNovel()

  if (!scene) return (
    <div className="editor-meta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>选择章节后生成场景</span>
    </div>
  )

  return (
    <div className="editor-meta">
      {/* Plot Progress */}
      <MetaSection title="五线进度">
        {plotLines.map(l => (
          <div key={l.id} className="progress-item">
            <span className="prog-label" style={{ color: `var(--color-${l.color})` }}>{l.name}</span>
            <div className="prog-bar">
              <div className="prog-fill" style={{ width: `${l.progress * 100}%`, backgroundColor: `var(--color-${l.color})` }} />
            </div>
            <span className="prog-value">{Math.round(l.progress * 100)}%</span>
          </div>
        ))}
      </MetaSection>

      {/* Conflict */}
      <MetaSection title="冲突">
        <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '10px' }}>
          {scene.conflict.type.map(t => <ConflictBadge key={t} type={t} />)}
        </div>
        <div className="progress-item">
          <span className="prog-label">强度</span>
          <div className="prog-bar">
            <div className="prog-fill" style={{
              width: `${scene.conflict.intensity * 100}%`,
              backgroundColor: scene.conflict.intensity > 0.7 ? 'var(--color-error)' : scene.conflict.intensity > 0.4 ? 'var(--color-warning)' : 'var(--color-info)'
            }} />
          </div>
          <span className="prog-value">{scene.conflict.intensity}</span>
        </div>
        {scene.conflict.turningPoint && <div style={{ fontSize: '0.72rem', color: 'var(--color-warning)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>⚡ 转折点</div>}
        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>{scene.conflict.resolution}</div>
      </MetaSection>

      {/* Beats */}
      <MetaSection title="节拍" count={scene.beats.length}>
        <div className="beats-list">
          {scene.beats.map((b, i) => (
            <div key={i} className="beat-item">
              <span className="beat-num">{i + 1}</span>
              <span>{b}</span>
            </div>
          ))}
        </div>
      </MetaSection>

      {/* Foreshadowing */}
      <MetaSection title="伏笔">
        {scene.foreshadow.planted.length > 0 && (
          <div className="mb-3">
            <div style={{ fontSize: '0.68rem', color: 'var(--color-info)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>种植 ↓</div>
            {scene.foreshadow.planted.map(fid => {
              const f = foreshadows.find(x => x.id === fid)
              return f ? <ForeshadowTag key={fid} item={{ ...f, status: 'planted' }} size="sm" /> : null
            })}
          </div>
        )}
        {scene.foreshadow.triggered.length > 0 && (
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--color-warning)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>触发 ⟫</div>
            {scene.foreshadow.triggered.map(fid => {
              const f = foreshadows.find(x => x.id === fid)
              return f ? <ForeshadowTag key={fid} item={{ ...f, status: 'reinforced' }} size="sm" /> : null
            })}
          </div>
        )}
        {scene.foreshadow.planted.length === 0 && scene.foreshadow.triggered.length === 0 && (
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>本场景无伏笔活动</div>
        )}
      </MetaSection>

      {/* Characters */}
      <MetaSection title="出场角色" count={chapter.characters.length}>
        {chapter.characters.map(name => {
          const c = characters.find(x => x.name === name)
          return c ? (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: `var(--color-${c.color})` }} />
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-primary)' }}>{c.name}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>{c.role}</span>
            </div>
          ) : null
        })}
      </MetaSection>

      <MetaSection title="校验状态 · N-6.2">
        <div className="validation-list">
          {validation.checks.map(c => (
            <div key={c.id} className="validation-row">
              <span className={c.ok ? 'val-ok' : 'val-fail'}>{c.ok ? '✓' : '✗'}</span>
              <span>{c.label}</span>
            </div>
          ))}
        </div>
        {validation.issues.length > 0 && (
          <ul className="validation-issues">
            {validation.issues.map((issue, i) => (
              <li key={i} className={issue.level === 'error' ? 'issue-error' : 'issue-warn'}>
                {issue.ruleId && <code>{issue.ruleId}</code>} {issue.message}
              </li>
            ))}
          </ul>
        )}
        <div className={`validation-summary ${validation.passed ? 'val-pass' : 'val-fail-box'}`}>
          {validation.passed
            ? `✓ 通过 · ${validation.warningCount} 警告`
            : `✗ ${validation.errorCount} 错误 · ${validation.warningCount} 警告`}
        </div>
      </MetaSection>
    </div>
  )
}

function MetaSection({ title, count, children }) {
  return (
    <div className="meta-section">
      <div className="meta-section-title">
        <span>{title}</span>
        {count !== undefined && <span className="count">{count}</span>}
      </div>
      {children}
    </div>
  )
}

// ─── Main View ───
export default function ContentView() {
  return (
    <>
      <ChapterList />
      <div className="content-main">
        <SceneTabs />
        <div className="editor-area">
          <SceneContent />
          <MetaPanel />
        </div>
      </div>
    </>
  )
}
