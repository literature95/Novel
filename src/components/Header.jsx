// src/components/Header.jsx
import { useNovel } from '../store'
import { CHAPTERS, PHASES } from '../data'
import { Btn } from './ui'
import { Download, Sparkles, Check } from 'lucide-react'

export default function Header() {
  const { view, phase, chapterIdx, generating, generateScene } = useNovel()

  const crumbs = {
    structure: ['小说结构生成', PHASES[phase].name],
    content: ['小说内容创作', `第${CHAPTERS[chapterIdx].id}章 ${CHAPTERS[chapterIdx].title}`],
    settings: ['AI 模型设置', '配置面板']
  }
  const [parent, current] = crumbs[view] || ['', '']

  function exportJSON() {
    import('../data').then(data => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'snowflake_v2_export.json'
      a.click()
    })
  }

  return (
    <header className="main-header">
      <div className="breadcrumb">
        <span>{parent}</span>
        <span className="sep">›</span>
        <span className="current">{current}</span>
      </div>
      <div className="actions">
        <button className="btn btn-ghost btn-sm" onClick={exportJSON}>↓ 导出JSON</button>
        {view === 'content' ? (
          <button className="btn btn-primary btn-sm" onClick={generateScene} disabled={generating}>
            {generating ? '生成中...' : '✦ AI 生成场景'}
          </button>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={() => alert('AI 生成功能')}>✦ AI 生成</button>
        )}
        {view === 'structure' && (
          <button className="btn btn-ghost btn-sm" onClick={() => alert('校验功能')}>✓ 校验</button>
        )}
      </div>
    </header>
  )
}
