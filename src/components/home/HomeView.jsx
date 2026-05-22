// src/components/home/HomeView.jsx
import { useNovel } from '../../store'
import NodeProgressPanel from './NodeProgressPanel'
import { 
  BookOpen, Users, MapPin, Zap, Clock, Target, CheckCircle,
  Play, FileText, Eye, AlertCircle, ChevronRight, Sparkles
} from 'lucide-react'

export default function HomeView() {
  const {
    meta, chapters, totalWords, totalTarget,
    doneChapters, resolvedFs, totalFs, setView, healthScore,
    characters = [], locations = [], magicSystem = [], timeline = [], foreshadows = [],
  } = useNovel()

  const wordProgress = totalTarget > 0 ? Math.round(totalWords / totalTarget * 100) : 0
  const aliveChars = characters.filter(c => c.status !== 'dead').length
  const deadChars = characters.length - aliveChars
  const plantedFs = foreshadows.filter(f => f.status === 'planted').length
  const triggeredFs = foreshadows.filter(f => f.status === 'triggered').length

  // 获取未回收且即将到期的伏笔
  const upcomingDeadlines = foreshadows
    .filter(f => f.status !== 'resolved' && f.deadline)
    .slice(0, 3)

  // 获取最近的章节
  const recentChapters = [...chapters].sort((a, b) => (b.number || 0) - (a.number || 0)).slice(0, 5)

  return (
    <div className="home-view fade-up">
      {/* 欢迎区域 */}
      <div className="home-header">
        <div className="home-header-top">
          <div>
            <h2>欢迎回来</h2>
            <p className="home-subtitle">{meta.title}</p>
          </div>
          <div className="home-health-score">
            <div className="health-score-circle">
              <span className="health-score-num">{healthScore}</span>
              <span className="health-score-label">健康度</span>
            </div>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="home-stats-grid">
        <StatCard icon={<BookOpen size={20} />} label="总字数" value={totalWords.toLocaleString()} 
          sub={`目标 ${totalTarget.toLocaleString()}`} color="blue" progress={wordProgress} />
        <StatCard icon={<Target size={20} />} label="写作进度" value={`${wordProgress}%`} 
          sub={`${doneChapters}/${chapters.length} 章节完成`} color="green" progress={chapters.length > 0 ? doneChapters / chapters.length * 100 : 0} />
        <StatCard icon={<Users size={20} />} label="角色库" value={characters.length} 
          sub={`存活 ${aliveChars} / 死亡 ${deadChars}`} color="purple" />
        <StatCard icon={<CheckCircle size={20} />} label="伏笔回收" value={`${resolvedFs}/${totalFs}`} 
          sub={`回收率 ${totalFs > 0 ? Math.round(resolvedFs/totalFs*100) : 0}%`} color="orange" 
          progress={totalFs > 0 ? resolvedFs / totalFs * 100 : 0} />
      </div>

      <NodeProgressPanel />

      {/* 快捷操作 */}
      <div className="home-section">
        <h3 className="home-section-title">快捷操作</h3>
        <div className="quick-actions">
          <QuickAction icon={<Play size={20} />} label="继续写作" desc="从上一章开始" onClick={() => setView('content')} highlight />
          <QuickAction icon={<FileText size={20} />} label="创建章节" desc="添加新章节" onClick={() => setView('structure')} />
          <QuickAction icon={<Eye size={20} />} label="预览作品" desc="查看全文" onClick={() => setView('content')} />
          <QuickAction icon={<Sparkles size={20} />} label="AI 灵感" desc="获取创作灵感" onClick={() => setView('settings')} />
        </div>
      </div>

      {/* 双栏布局 */}
      <div className="home-main-grid">
        {/* 左侧：世界观概览 */}
        <div className="home-section">
          <h3 className="home-section-title">世界观构建</h3>
          <div className="home-cards-row">
            <InfoCard icon={<MapPin size={18} />} title="地点库" count={locations.length} desc="场景地点管理" link="structure" />
            <InfoCard icon={<Zap size={18} />} title="力量体系" count={magicSystem.length} desc="超自然能力定义" link="structure" />
            <InfoCard icon={<Clock size={18} />} title="时间线" count={timeline.length} desc="历史纪年事件" link="structure" />
          </div>
        </div>

        {/* 右侧：项目概览 */}
        <div className="home-section">
          <h3 className="home-section-title">项目概览</h3>
          <div className="home-overview">
            <div className="overview-row">
              <span className="overview-label">小说标题</span>
              <span className="overview-value">{meta.title}</span>
            </div>
            <div className="overview-row">
              <span className="overview-label">小说类型</span>
              <span className="overview-value">{meta.genre || '未设置'}</span>
            </div>
            <div className="overview-row">
              <span className="overview-label">伏笔状态</span>
              <span className="overview-value">
                <span className="fs-tag fs-planted">{plantedFs} 种植</span>
                <span className="fs-tag fs-triggered">{triggeredFs} 触发</span>
                <span className="fs-tag fs-resolved">{resolvedFs} 回收</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 章节进度 */}
      {chapters.length > 0 && (
        <div className="home-section">
          <div className="section-header">
            <h3 className="home-section-title">最近章节</h3>
            <button className="view-all-btn" onClick={() => setView('content')}>
              查看全部 <ChevronRight size={14} />
            </button>
          </div>
          <div className="chapter-progress-list">
            {recentChapters.map((ch, i) => (
              <div key={ch.id || i} className="chapter-progress-item">
                <span className="chapter-num">第{ch.number || i + 1}章</span>
                <span className="chapter-title">{ch.title}</span>
                {ch.pov && <span className="chapter-pov">{ch.pov}</span>}
                <span className={`chapter-status status-${ch.status || 'pending'}`}>
                  {ch.status === 'done' ? '已完成' : ch.status === 'writing' ? '写作中' : '待开始'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 伏笔到期提醒 */}
      {upcomingDeadlines.length > 0 && (
        <div className="home-section">
          <h3 className="home-section-title">
            <AlertCircle size={16} className="alert-icon" /> 即将到期的伏笔
          </h3>
          <div className="deadline-list">
            {upcomingDeadlines.map((f, i) => (
              <div key={f.id || i} className="deadline-item">
                <span className="deadline-id">{f.id}</span>
                <span className="deadline-title">{f.title}</span>
                <span className="deadline-date">截止: {f.deadline}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, sub, color, progress }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-sub">{sub}</div>
        {progress !== undefined && (
          <div className="stat-progress-bar">
            <div className="stat-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </div>
  )
}

function InfoCard({ icon, title, count, desc, link }) {
  const { setView } = useNovel()
  return (
    <div className="info-card" onClick={() => setView(link)}>
      <div className="info-icon">{icon}</div>
      <div className="info-content">
        <div className="info-title">{title}</div>
        <div className="info-count">{count} 项</div>
        <div className="info-desc">{desc}</div>
      </div>
      <ChevronRight size={16} className="info-arrow" />
    </div>
  )
}

function QuickAction({ icon, label, desc, onClick, highlight }) {
  return (
    <button className={`quick-action ${highlight ? 'highlight' : ''}`} onClick={onClick}>
      <div className="quick-icon">{icon}</div>
      <div className="quick-text">
        <div className="quick-label">{label}</div>
        <div className="quick-desc">{desc}</div>
      </div>
    </button>
  )
}
