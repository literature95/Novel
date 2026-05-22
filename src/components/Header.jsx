// src/components/Header.jsx
import { useNovel } from '../store'

const SAVE_LABEL = { saved: '已保存', saving: '保存中…', error: '保存失败' }

export default function Header() {
  const {
    view, phase, chapterIdx, chapters, phases, meta,
    generating, generateScene,
    exportProject, triggerImport, resetProject, saveStatus,
    globalScan, setView, setPhase,
  } = useNovel()

  const chapter = chapters[chapterIdx]
  const crumbs = {
    home: ['项目首页', meta.title],
    structure: ['小说结构生成', phases[phase]?.name ?? ''],
    content: chapter ? ['小说内容创作', `第${chapter.id}章 ${chapter.title}`] : ['小说内容创作', ''],
    settings: ['AI 模型设置', '配置面板'],
  }
  const [parent, current] = crumbs[view] || ['', '']

  const runStructureScan = () => {
    setPhase(5)
    if (!globalScan.passed) {
      alert(`约束扫描：${globalScan.errorCount} 个错误，${globalScan.warningCount} 个警告（${globalScan.flaggedCount}/${globalScan.totalScenes} 个场景需关注）`)
    } else {
      alert(`约束扫描通过 · 共 ${globalScan.totalScenes} 个场景`)
    }
  }

  return (
    <header className="main-header">
      <div className="breadcrumb">
        <span>{parent}</span>
        <span className="sep">›</span>
        <span className="current">{current}</span>
      </div>
      <div className="actions">
        <span className={`save-indicator save-${saveStatus}`} title="自动保存到浏览器 localStorage">
          {SAVE_LABEL[saveStatus] || saveStatus}
        </span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={triggerImport}>↑ 导入JSON</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={exportProject}>↓ 导出JSON</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={resetProject} title="清除本地缓存并恢复示例数据">↺ 重置</button>
        {view === 'structure' && (
          <button
            type="button"
            className={`btn btn-ghost btn-sm ${!globalScan.passed ? 'btn-warn' : ''}`}
            onClick={runStructureScan}
            title="全项目场景约束扫描 (N-6.2)"
          >
            {globalScan.passed ? '✓ 扫描' : `✗ 扫描 (${globalScan.errorCount})`}
          </button>
        )}
        {view === 'content' ? (
          <button type="button" className="btn btn-primary btn-sm" onClick={generateScene} disabled={generating}>
            {generating ? '生成中...' : '✦ AI 生成场景'}
          </button>
        ) : view !== 'home' && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setView('settings')} title="AI 配置">
            ✦ AI
          </button>
        )}
      </div>
    </header>
  )
}
