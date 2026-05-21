// src/components/structure/StructureView.jsx
import { useNovel } from '../../store'
import { PHASES, CHARACTERS, PLOT_LINES, FORESHADOWS, CONSTRAINTS, CHAPTERS, ACTS } from '../../data'
import { ForeshadowTag } from '../ui'

// ─── Phase Tabs ───
function PhaseTabs() {
  const { phase, setPhase } = useNovel()
  return (
    <div className="struct-topbar">
      {PHASES.map((p, i) => (
        <div
          key={p.id}
          onClick={() => setPhase(i)}
          className={`phase-tab ${i === phase ? 'active' : ''}`}
        >
          <span className={`dot dot-${p.status}`} />
          阶段{p.id}: {p.name}
        </div>
      ))}
    </div>
  )
}

// ─── Node Card ───
function NodeCard({ node }) {
  const statusClass = { done: 'badge-done', progress: 'badge-progress', locked: 'badge-locked', skip: 'badge-locked' }
  const statusText = { done: '已完成', progress: '进行中', locked: '已锁定', skip: '已跳过' }
  return (
    <div className="struct-card">
      <div className="card-header">
        <span className="card-title">{node.name}</span>
        <span className={`card-status ${statusClass[node.status]}`}>{statusText[node.status]}</span>
      </div>
      <div className="card-desc">{node.desc}</div>
      <div className="card-meta">
        <span>节点 {node.id}</span>
        <span>{node.count} 条目</span>
      </div>
    </div>
  )
}

// ─── Phase 1: World Building ───
function Phase1() {
  const { setView } = useNovel()
  const phase = PHASES[0]
  return (
    <div className="struct-content fade-up">
      <div className="struct-grid">
        {phase.nodes.slice(0, 4).map(n => <NodeCard key={n.id} node={n} />)}
      </div>

      {/* Characters */}
      <div className="struct-section">
        <div className="struct-section-header">
          <h3>角色库 · {CHARACTERS.length} 位角色</h3>
          <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm">+ 添加角色</button>
            <button className="btn btn-primary btn-sm">✦ AI 生成</button>
          </div>
        </div>
        <div className="char-grid">
          {CHARACTERS.map(c => (
            <div key={c.name} className="char-card" style={{ borderLeftColor: `var(--color-${c.color})`, borderLeftWidth: '3px' }}>
              <div className="char-card-header">
                <span className="char-name">{c.name}</span>
                <span className="badge badge-progress">{c.role}</span>
              </div>
              <div className="char-arc">{c.arc}</div>
              <div className="char-meta">
                <span>状态: {c.status}</span>
                <span>弧线: {Math.round(c.progress * 100)}%</span>
              </div>
              <div className="progress-bar">
                <div className="fill" style={{ width: `${c.progress * 100}%`, background: `var(--color-${c.color})` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Constraints */}
      <div className="struct-section">
        <div className="struct-section-header">
          <h3>约束规则库 · {CONSTRAINTS.length} 条规则</h3>
          <button className="btn btn-ghost btn-sm">+ 添加规则</button>
        </div>
        <div className="rule-list">
          {CONSTRAINTS.map(r => {
            const borderColor = r.type === 'absolute' ? 'var(--color-error)' : r.type === 'soft' ? 'var(--color-warning)' : 'var(--color-text-muted)'
            return (
              <div key={r.id} className="rule-item" style={{ borderLeftColor: borderColor, borderLeftWidth: '3px', borderLeftStyle: 'solid' }}>
                <span className="rule-id">{r.id}</span>
                <span className={`badge badge-locked`} style={{ background: r.type === 'absolute' ? 'rgba(196, 107, 107, 0.15)' : r.type === 'soft' ? 'rgba(212, 168, 83, 0.15)' : 'rgba(107, 99, 90, 0.2)', color: borderColor }}>{r.type}</span>
                <span className="rule-name">{r.name}</span>
                <span className="rule-desc">{r.desc}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Phase 2: Narrative Planning ───
function Phase2() {
  return (
    <div className="struct-content fade-up">
      <div className="two-col-grid">
        {/* Three Acts */}
        <div className="struct-card">
          <div className="card-header">
            <span className="card-title">三幕结构</span>
            <span className="badge badge-done">已完成</span>
          </div>
          {ACTS.map(act => (
            <div key={act.name} className="act-row">
              <div className="act-row-header">
                <span className="act-name">{act.name}</span>
                <span className="act-range">{act.range}</span>
              </div>
              <div className="progress-bar">
                <div className="fill" style={{ width: `${act.width}%` }} />
              </div>
              <div className="act-goal">{act.goal}</div>
            </div>
          ))}
        </div>

        {/* Five Lines */}
        <div className="struct-card">
          <div className="card-header">
            <span className="card-title">五线规划</span>
            <span className="badge badge-done">已完成</span>
          </div>
          {PLOT_LINES.map(l => (
            <div key={l.id} className="progress-item">
              <span className="prog-label" style={{ color: `var(--color-${l.color})` }}>{l.name}</span>
              <div className="prog-bar">
                <div className="prog-fill" style={{ width: `${l.progress * 100}%`, backgroundColor: `var(--color-${l.color})` }} />
              </div>
              <span className="prog-value">{Math.round(l.progress * 100)}%</span>
            </div>
          ))}
          <div className="milestone">当前里程碑: {PLOT_LINES[0].milestone}</div>
        </div>
      </div>

      {/* Foreshadow Network */}
      <div className="struct-section">
        <div className="struct-section-header">
          <h3>伏笔网 · {FORESHADOWS.length} 条伏笔</h3>
          <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm">+ 添加伏笔</button>
            <button className="btn btn-primary btn-sm">✦ AI 推荐</button>
          </div>
        </div>
        <div className="fs-list">
          {FORESHADOWS.map(f => <ForeshadowTag key={f.id} item={f} />)}
        </div>
      </div>
    </div>
  )
}

// ─── Phase 4: Chapter Blueprint ───
function Phase4() {
  const { setView } = useNovel()
  const statusBorder = { done: 'border-l-verdant', progress: 'border-l-ochre', locked: 'border-l-faded' }
  const statusText = { done: '已完成', progress: '写作中', locked: '待解锁' }
  const statusBadge = { done: 'badge-done', progress: 'badge-progress', locked: 'badge-locked' }

  return (
    <div className="struct-content fade-up">
      <div className="struct-section">
        <div className="struct-section-header">
          <h3>逐章大纲 · {CHAPTERS.length}/60 章</h3>
          <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm">展开全部</button>
            <button className="btn btn-primary btn-sm">✦ AI 生成下一章</button>
          </div>
        </div>
        <div className="chapter-list">
          {CHAPTERS.map(ch => (
            <div key={ch.id} className="chapter-row" style={{ borderLeftColor: statusBorder[ch.status] === 'border-l-verdant' ? 'var(--color-success)' : statusBorder[ch.status] === 'border-l-ochre' ? 'var(--color-warning)' : 'var(--color-text-muted)', borderLeftWidth: '3px', borderLeftStyle: 'solid' }}>
              <span className="ch-id">Ch{ch.id}</span>
              <span className="ch-title">{ch.title}</span>
              <span className="ch-words">{ch.words}/{ch.targetWords}字</span>
              <span className="ch-scenes">{ch.scenes}场景</span>
              <div className="ch-dots">
                {ch.plotLines.map(id => {
                  const l = PLOT_LINES.find(p => p.id === id)
                  return <span key={id} className="dot-sm" style={{ backgroundColor: l ? `var(--color-${l.color})` : 'var(--color-text-muted)' }} />
                })}
              </div>
              <span className={`badge ${statusBadge[ch.status]}`}>{statusText[ch.status]}</span>
            </div>
          ))}
          <div className="chapter-more">
            ⋯ 第 7-60 章大纲待生成 · 点击「AI 生成下一章」继续
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Phase 5: Scene Writing ───
function Phase5() {
  const { setView } = useNovel()
  return (
    <div className="struct-content fade-up">
      <div className="empty-state">
        <div className="empty-icon">✏️</div>
        <h3>场景迭代写作</h3>
        <p>这是真正「落笔」的地方。每一个场景遵循固定的循环：AI 生成 → 自动校验 → 人工确认 → 锁定写入</p>
        <button className="btn btn-primary btn-sm" onClick={() => setView('content')}>→ 进入内容创作</button>
      </div>
    </div>
  )
}

// ─── Phase 6 & 7: Simple cards ───
function SimplePhase({ phase }) {
  return (
    <div className="struct-content fade-up">
      <div className="struct-grid">
        {phase.nodes.map(n => <NodeCard key={n.id} node={n} />)}
      </div>
    </div>
  )
}

// ─── Main View ───
export default function StructureView() {
  const { phase } = useNovel()
  const renderers = [Phase1, Phase2, () => <SimplePhase phase={PHASES[2]} />, Phase4, Phase5, () => <SimplePhase phase={PHASES[5]} />, () => <SimplePhase phase={PHASES[6]} />]

  return (
    <>
      <PhaseTabs />
      <div className="struct-content">
        {renderers[phase]?.()}
      </div>
    </>
  )
}
