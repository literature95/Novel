import { useNovel } from '../../store'

const TYPE_LABELS = { ability: '能力', rule: '规则', cost: '代价', artifact: '器物', other: '其他' }

export default function MagicPanel() {
  const {
    magicSystem = [],
    editingMagicIdx,
    setEditingMagicIdx,
    addMagic,
    updateMagic,
    deleteMagic,
  } = useNovel()

  const m = magicSystem[editingMagicIdx]

  return (
    <div className="struct-section edit-panel">
      <div className="struct-section-header">
        <h3>力量体系 · N-1.3 · {magicSystem.length} 条设定</h3>
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={addMagic}>+ 添加设定</button>
        </div>
      </div>

      <div className="edit-layout">
        <div className="edit-list">
          {magicSystem.map((item, i) => (
            <div
              key={item.id}
              className={`struct-row ${i === editingMagicIdx ? 'row-active' : ''}`}
              onClick={() => setEditingMagicIdx(i)}
            >
              <span className="row-id">{item.id}</span>
              <span className="row-name">{item.name}</span>
              <span className="row-tag">{TYPE_LABELS[item.type] || item.type}</span>
            </div>
          ))}
          {magicSystem.length === 0 && (
            <div className="empty-state py-3">
              <p>暂无力量设定，点击「+ 添加设定」创建</p>
            </div>
          )}
        </div>

        {m && (
          <div className="edit-form">
            <div className="edit-form-row">
              <label>名称</label>
              <input value={m.name} onChange={e => updateMagic(editingMagicIdx, { name: e.target.value })} />
            </div>
            <div className="edit-form-row">
              <label>类型</label>
              <select value={m.type} onChange={e => updateMagic(editingMagicIdx, { type: e.target.value })}>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="edit-form-row">
              <label>来源</label>
              <input value={m.source || ''} onChange={e => updateMagic(editingMagicIdx, { source: e.target.value })} placeholder="如：矿区遗迹影响" />
            </div>
            <div className="edit-form-row">
              <label>规则描述</label>
              <textarea rows={3} value={m.rules || ''} onChange={e => updateMagic(editingMagicIdx, { rules: e.target.value })} placeholder="该设定运作的具体规则" />
            </div>
            <div className="edit-form-row">
              <label>代价</label>
              <textarea rows={2} value={m.cost || ''} onChange={e => updateMagic(editingMagicIdx, { cost: e.target.value })} placeholder="使用该能力需付出的代价" />
            </div>
            <div className="edit-form-row">
              <label>用途说明</label>
              <textarea rows={2} value={m.usage || ''} onChange={e => updateMagic(editingMagicIdx, { usage: e.target.value })} placeholder="在故事中如何运用此设定" />
            </div>
            <div className="edit-form-row">
              <label>备注</label>
              <input value={m.note || ''} onChange={e => updateMagic(editingMagicIdx, { note: e.target.value })} placeholder="作者备忘" />
            </div>
            <button className="btn btn-ghost btn-sm mt-2" onClick={() => deleteMagic(editingMagicIdx)}>删除此设定</button>
          </div>
        )}
      </div>
    </div>
  )
}
