import { useNovel } from '../../store'

const STATUS_OPTIONS = [
  { value: 'drafted', label: 'drafted 草稿' },
  { value: 'planted', label: 'planted 已种植' },
  { value: 'reinforced', label: 'reinforced 已强化' },
  { value: 'partially_revealed', label: 'partially_revealed 部分揭示' },
  { value: 'resolved', label: 'resolved 已回收' },
  { value: 'misled', label: 'misled 误导分支' },
  { value: 'abandoned', label: 'abandoned 已废弃' },
]

const STATUS_COLORS = {
  drafted: 'var(--color-faded)',
  planted: 'var(--color-cerulean)',
  reinforced: 'var(--color-ochre)',
  partially_revealed: 'var(--color-warning)',
  resolved: 'var(--color-success)',
  misled: 'var(--color-crimson)',
  abandoned: 'var(--color-text-muted)',
}

export default function ForeshadowPanel() {
  const {
    foreshadows,
    editingFsIdx,
    setEditingFsIdx,
    addForeshadow,
    updateForeshadow,
    deleteForeshadow,
  } = useNovel()

  const f = foreshadows[editingFsIdx]

  return (
    <div className="struct-section edit-panel">
      <div className="struct-section-header">
        <h3>伏笔网 · N-2.3 · {foreshadows.length} 条伏笔</h3>
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={addForeshadow}>+ 添加伏笔</button>
        </div>
      </div>

      <div className="fs-list">
        {foreshadows.map((fs, i) => {
          const borderColor = STATUS_COLORS[fs.status] || STATUS_COLORS.drafted
          return (
            <div
              key={fs.id}
              role="button"
              tabIndex={0}
              onClick={() => setEditingFsIdx(i)}
              onKeyDown={e => e.key === 'Enter' && setEditingFsIdx(i)}
              className={`foreshadow-item ${i === editingFsIdx ? 'rule-item-active' : ''}`}
              style={{ borderLeftColor: borderColor, borderLeftWidth: '3px', borderLeftStyle: 'solid' }}
            >
              <div className="fs-header">
                <span className="fs-id">{fs.id}</span>
                <span className="fs-title">{fs.title}</span>
              </div>
              <div className="fs-meta">
                <span style={{ color: borderColor }}>● {fs.status}</span>
                <span>重要度: {fs.importance}</span>
                <span>种植: {fs.planted}</span>
                <span>截止: {fs.deadline}</span>
              </div>
            </div>
          )
        })}
      </div>

      {f && (
        <div className="edit-form">
          <h4 className="edit-form-title">编辑伏笔 {f.id}</h4>
          <div className="edit-form-grid">
            <label>
              伏笔 ID
              <input className="text-input" value={f.id} readOnly />
            </label>
            <label>
              状态
              <select
                className="select-input"
                value={f.status}
                onChange={e => updateForeshadow(editingFsIdx, { status: e.target.value })}
              >
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>
            <label>
              标题
              <input
                className="text-input"
                value={f.title}
                onChange={e => updateForeshadow(editingFsIdx, { title: e.target.value })}
              />
            </label>
            <label>
              重要度
              <input
                type="number"
                min={0}
                max={1}
                step={0.1}
                className="text-input"
                value={f.importance}
                onChange={e => updateForeshadow(editingFsIdx, { importance: parseFloat(e.target.value) || 0 })}
              />
            </label>
            <label>
              种植章节
              <input
                className="text-input"
                value={f.planted}
                onChange={e => updateForeshadow(editingFsIdx, { planted: e.target.value })}
                placeholder="Ch1 或 -"
              />
            </label>
            <label>
              截止章节
              <input
                className="text-input"
                value={f.deadline}
                onChange={e => updateForeshadow(editingFsIdx, { deadline: e.target.value })}
                placeholder="Ch30"
              />
            </label>
            <label className="edit-span-2">
              描述
              <textarea
                className="text-input edit-textarea"
                value={f.desc}
                onChange={e => updateForeshadow(editingFsIdx, { desc: e.target.value })}
                rows={3}
              />
            </label>
          </div>
          <div className="edit-form-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteForeshadow(editingFsIdx)}>
              删除伏笔
            </button>
            <span className="form-hint">伏笔状态: drafted → planted → reinforced → partially_revealed → resolved</span>
          </div>
        </div>
      )}
    </div>
  )
}