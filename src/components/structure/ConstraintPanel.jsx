import { useNovel } from '../../store'

const TYPES = [
  { value: 'absolute', label: 'absolute 硬规则' },
  { value: 'soft', label: 'soft 软规则' },
  { value: 'guideline', label: 'guideline 参考' },
]

export default function ConstraintPanel() {
  const {
    constraints,
    editingRuleIdx,
    setEditingRuleIdx,
    addConstraint,
    updateConstraint,
    deleteConstraint,
  } = useNovel()

  const r = constraints[editingRuleIdx]

  return (
    <div className="struct-section edit-panel">
      <div className="struct-section-header">
        <h3>约束规则库 · N-1.5 · {constraints.length} 条</h3>
        <button type="button" className="btn btn-ghost btn-sm" onClick={addConstraint}>+ 添加规则</button>
      </div>

      <div className="rule-list">
        {constraints.map((rule, i) => {
          const borderColor = rule.type === 'absolute'
            ? 'var(--color-error)'
            : rule.type === 'soft'
              ? 'var(--color-warning)'
              : 'var(--color-text-muted)'
          return (
            <div
              key={rule.id}
              role="button"
              tabIndex={0}
              onClick={() => setEditingRuleIdx(i)}
              onKeyDown={e => e.key === 'Enter' && setEditingRuleIdx(i)}
              className={`rule-item ${i === editingRuleIdx ? 'rule-item-active' : ''}`}
              style={{ borderLeftColor: borderColor, borderLeftWidth: '3px', borderLeftStyle: 'solid' }}
            >
              <span className="rule-id">{rule.id}</span>
              <span className="badge badge-locked" style={{
                background: rule.type === 'absolute' ? 'rgba(196, 107, 107, 0.15)' : rule.type === 'soft' ? 'rgba(212, 168, 83, 0.15)' : 'rgba(107, 99, 90, 0.2)',
                color: borderColor,
              }}>{rule.type}</span>
              <span className="rule-name">{rule.name}</span>
              <span className="rule-desc">{rule.desc}</span>
            </div>
          )
        })}
      </div>

      {r && (
        <div className="edit-form">
          <h4 className="edit-form-title">编辑规则 {r.id}</h4>
          <div className="edit-form-grid">
            <label>
              类型
              <select
                className="select-input"
                value={r.type}
                onChange={e => updateConstraint(editingRuleIdx, { type: e.target.value })}
              >
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>
            <label>
              规则 ID
              <input className="text-input" value={r.id} readOnly />
            </label>
            <label className="edit-span-2">
              名称
              <input
                className="text-input"
                value={r.name}
                onChange={e => updateConstraint(editingRuleIdx, { name: e.target.value })}
              />
            </label>
            <label className="edit-span-2">
              说明
              <textarea
                className="text-input edit-textarea"
                value={r.desc}
                onChange={e => updateConstraint(editingRuleIdx, { desc: e.target.value })}
                rows={2}
              />
            </label>
          </div>
          <div className="edit-form-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteConstraint(editingRuleIdx)}>
              删除规则
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
