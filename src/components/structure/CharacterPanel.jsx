import { useNovel } from '../../store'

const COLORS = ['cerulean', 'rose', 'crimson', 'olive', 'ochre', 'amber']
const ROLES = ['男主', '女主', '反派', '配角']

export default function CharacterPanel() {
  const {
    characters,
    editingCharIdx,
    setEditingCharIdx,
    addCharacter,
    updateCharacter,
    deleteCharacter,
  } = useNovel()

  const c = characters[editingCharIdx]

  return (
    <div className="struct-section edit-panel">
      <div className="struct-section-header">
        <h3>角色库 · N-1.1 · {characters.length} 位</h3>
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={addCharacter}>+ 添加角色</button>
        </div>
      </div>

      <div className="char-grid">
        {characters.map((ch, i) => (
          <div
            key={`${ch.name}-${i}`}
            role="button"
            tabIndex={0}
            onClick={() => setEditingCharIdx(i)}
            onKeyDown={e => e.key === 'Enter' && setEditingCharIdx(i)}
            className={`char-card ${i === editingCharIdx ? 'char-card-active' : ''}`}
            style={{ borderLeftColor: `var(--color-${ch.color})`, borderLeftWidth: '3px' }}
          >
            <div className="char-card-header">
              <span className="char-name">{ch.name}</span>
              <span className={`badge ${ch.status === 'dead' ? 'badge-locked' : 'badge-progress'}`}>
                {ch.status === 'dead' ? '已故' : ch.role}
              </span>
            </div>
            <div className="char-arc">{ch.arc || '（未填写弧线）'}</div>
            <div className="char-meta">
              <span>弧线 {Math.round((ch.progress || 0) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>

      {c && (
        <div className="edit-form">
          <h4 className="edit-form-title">编辑：{c.name}</h4>
          <div className="edit-form-grid">
            <label>
              姓名
              <input
                className="text-input"
                value={c.name}
                onChange={e => updateCharacter(editingCharIdx, { name: e.target.value })}
              />
            </label>
            <label>
              定位
              <select
                className="select-input"
                value={c.role}
                onChange={e => updateCharacter(editingCharIdx, { role: e.target.value })}
              >
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <label>
              生存状态
              <select
                className="select-input"
                value={c.status}
                onChange={e => updateCharacter(editingCharIdx, { status: e.target.value })}
              >
                <option value="alive">存活</option>
                <option value="dead">死亡</option>
              </select>
            </label>
            <label>
              标识色
              <select
                className="select-input"
                value={c.color}
                onChange={e => updateCharacter(editingCharIdx, { color: e.target.value })}
              >
                {COLORS.map(col => <option key={col} value={col}>{col}</option>)}
              </select>
            </label>
            <label className="edit-span-2">
              人物弧线
              <input
                className="text-input"
                value={c.arc}
                onChange={e => updateCharacter(editingCharIdx, { arc: e.target.value })}
              />
            </label>
            <label className="edit-span-2">
              背景
              <textarea
                className="text-input edit-textarea"
                value={c.background}
                onChange={e => updateCharacter(editingCharIdx, { background: e.target.value })}
                rows={2}
              />
            </label>
            <label className="edit-span-2">
              弧线进度 {(c.progress * 100).toFixed(0)}%
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(c.progress * 100)}
                onChange={e => updateCharacter(editingCharIdx, { progress: Number(e.target.value) / 100 })}
                className="range-input"
              />
            </label>
          </div>
          <div className="edit-form-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteCharacter(editingCharIdx)}>
              删除角色
            </button>
            <span className="form-hint">修改后将触发下游节点回溯标记（黄/红）</span>
          </div>
        </div>
      )}
    </div>
  )
}
