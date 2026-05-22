import { useNovel } from '../../store'

const STATUS_COLORS = {
  drafted: 'var(--color-faded)',
  planted: 'var(--color-cerulean)',
  reinforced: 'var(--color-ochre)',
  partially_revealed: 'var(--color-warning)',
  resolved: 'var(--color-success)',
  misled: 'var(--color-crimson)',
  abandoned: 'var(--color-text-muted)',
}

const STATUS_LABELS = {
  drafted: '草稿',
  planted: '已种植',
  reinforced: '已强化',
  partially_revealed: '部分揭示',
  resolved: '已回收',
  misled: '误导分支',
  abandoned: '已废弃',
}

export default function ForeshadowBoard() {
  const { foreshadows, chapters } = useNovel()

  // 计算超期伏笔
  const getOverdue = (fs) => {
    if (fs.status === 'resolved' || fs.status === 'abandoned') return false
    const deadlineMatch = fs.deadline.match(/Ch(\d+)/)
    if (!deadlineMatch) return false
    const deadlineCh = parseInt(deadlineMatch[1])
    const currentCh = chapters.filter(c => c.status === 'done').length
    return currentCh > deadlineCh
  }

  // 计算即将到期（3章内）
  const getNearDeadline = (fs) => {
    if (fs.status === 'resolved' || fs.status === 'abandoned') return false
    const deadlineMatch = fs.deadline.match(/Ch(\d+)/)
    if (!deadlineMatch) return false
    const deadlineCh = parseInt(deadlineMatch[1])
    const currentCh = chapters.filter(c => c.status === 'done').length
    return currentCh <= deadlineCh && currentCh >= deadlineCh - 3
  }

  const stats = {
    total: foreshadows.length,
    drafted: foreshadows.filter(f => f.status === 'drafted').length,
    planted: foreshadows.filter(f => f.status === 'planted').length,
    reinforced: foreshadows.filter(f => f.status === 'reinforced').length,
    partially_revealed: foreshadows.filter(f => f.status === 'partially_revealed').length,
    resolved: foreshadows.filter(f => f.status === 'resolved').length,
    misled: foreshadows.filter(f => f.status === 'misled').length,
    abandoned: foreshadows.filter(f => f.status === 'abandoned').length,
    overdue: foreshadows.filter(getOverdue).length,
    nearDeadline: foreshadows.filter(getNearDeadline).length,
  }

  const recoveryRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0

  return (
    <div className="struct-section">
      <div className="struct-section-header">
        <h3>伏笔看板 · N-6.1</h3>
      </div>

      {/* 统计概览 */}
      <div className="fs-stats-grid">
        <div className="fs-stat-card">
          <span className="fs-stat-value" style={{ color: 'var(--color-success)' }}>{recoveryRate}%</span>
          <span className="fs-stat-label">回收率</span>
        </div>
        <div className="fs-stat-card">
          <span className="fs-stat-value">{stats.resolved}/{stats.total}</span>
          <span className="fs-stat-label">已回收/总数</span>
        </div>
        <div className="fs-stat-card">
          <span className="fs-stat-value" style={{ color: stats.overdue > 0 ? 'var(--color-error)' : 'var(--color-text-muted)' }}>{stats.overdue}</span>
          <span className="fs-stat-label">超期告警</span>
        </div>
        <div className="fs-stat-card">
          <span className="fs-stat-value" style={{ color: stats.nearDeadline > 0 ? 'var(--color-warning)' : 'var(--color-text-muted)' }}>{stats.nearDeadline}</span>
          <span className="fs-stat-label">即将到期</span>
        </div>
      </div>

      {/* 状态分布 */}
      <div className="fs-status-bar">
        {Object.entries(STATUS_LABELS).map(([key, label]) => {
          const count = stats[key]
          if (count === 0) return null
          const pct = (count / stats.total) * 100
          return (
            <div
              key={key}
              className="fs-status-segment"
              style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[key] }}
              title={`${label}: ${count}`}
            />
          )
        })}
      </div>

      {/* 伏笔列表 */}
      <div className="fs-board-list">
        {foreshadows.map(fs => {
          const isOverdue = getOverdue(fs)
          const isNearDeadline = getNearDeadline(fs)
          return (
            <div
              key={fs.id}
              className={`fs-board-item ${isOverdue ? 'overdue' : ''} ${isNearDeadline ? 'near-deadline' : ''}`}
            >
              <div className="fs-board-header">
                <span className="fs-board-id">{fs.id}</span>
                <span className="fs-board-title">{fs.title}</span>
                <span
                  className="fs-board-status"
                  style={{ color: STATUS_COLORS[fs.status] }}
                >
                  ● {STATUS_LABELS[fs.status]}
                </span>
              </div>
              <div className="fs-board-meta">
                <span>重要度: {fs.importance}</span>
                <span>种植: {fs.planted}</span>
                <span>截止: {fs.deadline}</span>
                {isOverdue && <span className="fs-alert">⚠️ 已超期</span>}
                {isNearDeadline && !isOverdue && <span className="fs-warn">⏰ 即将到期</span>}
              </div>
              <div className="fs-board-desc">{fs.desc}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
