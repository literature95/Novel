import { useMemo } from 'react'
import { useNovel } from '../../store'
import { summarizeNodeProgress } from '../../lib/node-progress'
import { NODE_STATUS } from '../../lib/nodes'

export default function NodeProgressPanel() {
  const { project, phases, setView, setPhase, healthScore } = useNovel()
  const summary = useMemo(() => summarizeNodeProgress(project), [project])

  const phaseGroups = phases.map((p, i) => ({
    phase: p,
    index: i,
    nodes: summary.items.filter(n => n.phaseId === p.id),
  }))

  return (
    <div className="home-section node-progress-section">
      <div className="section-header">
        <h3 className="home-section-title">节点实现进度</h3>
        <span className="node-progress-pct">{summary.percent}% · {summary.done}/{summary.counts.total}</span>
      </div>
      <p className="node-progress-hint">
        对照 <code>状态节点.md</code> · 综合健康度 <strong>{healthScore}</strong>
      </p>
      <div className="node-progress-grid">
        {phaseGroups.map(({ phase, index, nodes }) => (
          <button
            key={phase.id}
            type="button"
            className="phase-progress-card"
            onClick={() => { setView('structure'); setPhase(index) }}
          >
            <div className="phase-progress-head">
              <span>阶段{phase.id}</span>
              <span className="phase-progress-name">{phase.name}</span>
            </div>
            <div className="phase-progress-dots">
              {nodes.map(n => {
                const meta = NODE_STATUS[n.effective] || NODE_STATUS.unlocked
                return (
                  <span
                    key={n.nodeKey}
                    className={`node-dot node-dot-${n.effective}`}
                    title={`${n.nodeKey} ${n.name} · ${meta.label}`}
                  />
                )
              })}
            </div>
          </button>
        ))}
      </div>
      <div className="node-legend">
        <span><i className="node-dot node-dot-completed" /> 已完成</span>
        <span><i className="node-dot node-dot-progress" /> 进行中</span>
        <span><i className="node-dot node-dot-unlocked" /> 待开始</span>
        <span><i className="node-dot node-dot-blocked" /> 已锁定</span>
        <span><i className="node-dot node-dot-stale_review" /> 待审查</span>
      </div>
    </div>
  )
}
