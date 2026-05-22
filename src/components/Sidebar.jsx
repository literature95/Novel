// src/components/Sidebar.jsx
import { useNovel } from '../store'
import { Badge, ProgressBar } from './ui'
import { Snowflake, PenTool, Settings } from 'lucide-react'

export default function Sidebar() {
  const {
    view, setView, meta, chapters,
    totalWords, totalTarget, doneChapters, resolvedFs, totalFs,
  } = useNovel()

  const totalChapterTarget = 60
  const chapterProgress = `${doneChapters}/${totalChapterTarget}`
  const wordProgress = totalTarget > 0 ? Math.round(totalWords / totalTarget * 100) : 0

  const NAV = [
    { key: 'home', label: '项目首页', emoji: '🏠', badge: null },
    { key: 'structure', label: '小说结构生成', emoji: '📐', badge: { text: '进行中', variant: 'progress' } },
    { key: 'content', label: '小说内容创作', emoji: '✍️', badge: { text: chapterProgress, variant: 'progress' } },
    { key: 'settings', label: 'AI 模型设置', emoji: '⚙️', badge: null },
  ]

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <h1><span className="snowflake">❄</span> 雪花小说工坊</h1>
        <div className="project-name">{meta.title}</div>
      </div>
      
      <div className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">展示区</div>
          <NavItem item={NAV[0]} active={view === 'home'} onClick={() => setView('home')} />
        </div>

        <div className="nav-section">
          <div className="nav-section-title">工作区</div>
          {NAV.slice(1, 3).map(item => <NavItem key={item.key} item={item} active={view === item.key} onClick={() => setView(item.key)} />)}
        </div>
        <div className="nav-section">
          <div className="nav-section-title">系统</div>
          {NAV.slice(3).map(item => <NavItem key={item.key} item={item} active={view === item.key} onClick={() => setView(item.key)} />)}
        </div>
      </div>

      <div className="sidebar-stats">
        <div className="stat-row">
          <span className="label">总字数</span>
          <span className="value">{totalWords.toLocaleString()} / {totalTarget.toLocaleString()}</span>
        </div>
        <div className="stat-row">
          <span className="label">章节</span>
          <span className="value">{doneChapters} / {chapters.length}</span>
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
