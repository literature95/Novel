// src/components/Sidebar.jsx
import { useNovel } from '../store'
import { CHAPTERS } from '../data'
import { Badge, ProgressBar } from './ui'
import { Snowflake, PenTool, Settings } from 'lucide-react'

export default function Sidebar() {
  const { view, setView, totalWords, totalTarget, doneChapters, resolvedFs, plantedFs, totalFs } = useNovel()

  const totalChapterTarget = 60
  const chapterProgress = `${doneChapters}/${totalChapterTarget}`
  const wordProgress = Math.round(totalWords / totalTarget * 100)

  const NAV = [
    { key: 'structure', label: '小说结构生成', icon: Snowflake, emoji: '📐', badge: { text: '进行中', variant: 'progress' } },
    { key: 'content', label: '小说内容创作', icon: PenTool, emoji: '✍️', badge: { text: chapterProgress, variant: 'progress' } },
    { key: 'settings', label: 'AI 模型设置', icon: Settings, emoji: '⚙️', badge: null },
  ]

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <h1><span className="snowflake">❄</span> 雪花叙事工坊</h1>
        <div className="project-name">雾隐镇谜案</div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">工作区</div>
          {NAV.slice(0, 2).map(item => <NavItem key={item.key} item={item} active={view === item.key} onClick={() => setView(item.key)} />)}
        </div>
        <div className="nav-section">
          <div className="nav-section-title">系统</div>
          {NAV.slice(2).map(item => <NavItem key={item.key} item={item} active={view === item.key} onClick={() => setView(item.key)} />)}
        </div>
      </div>

      <div className="sidebar-stats">
        <div className="stat-row">
          <span className="label">总字数</span>
          <span className="value">{totalWords.toLocaleString()} / {totalTarget.toLocaleString()}</span>
        </div>
        <div className="stat-row">
          <span className="label">章节</span>
          <span className="value">{doneChapters} / {CHAPTERS.length}</span>
        </div>
        <div className="stat-row">
          <span className="label">伏笔</span>
          <span className="value">{resolvedFs} / {totalFs} 回收</span>
        </div>
        <div className="progress-bar">
          <div className="fill" style={{ width: `${wordProgress}%` }} />
        </div>
      </div>
    </nav>
  )
}

function NavItem({ item, active, onClick }) {
  return (
    <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="icon">{item.emoji}</span>
      <span>{item.label}</span>
      {item.badge && <span className={`badge badge-${item.badge.variant}`}>{item.badge.text}</span>}
    </div>
  )
}
