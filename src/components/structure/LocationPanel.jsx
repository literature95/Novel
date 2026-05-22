import { useNovel } from '../../store'

const TYPE_LABELS = {
  town: '城镇', wild: '野外', building: '建筑',
  underground: '地下', route: '路径', other: '其他',
}

export default function LocationPanel() {
  const {
    locations = [],
    editingLocIdx,
    setEditingLocIdx,
    addLocation,
    updateLocation,
    deleteLocation,
  } = useNovel()

  const loc = locations[editingLocIdx]

  return (
    <div className="struct-section edit-panel">
      <div className="struct-section-header">
        <h3>地点库 · N-1.2 · {locations.length} 个地点</h3>
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={addLocation}>+ 添加地点</button>
        </div>
      </div>

      <div className="edit-layout">
        <div className="edit-list">
          {locations.map((l, i) => (
            <div
              key={l.id}
              className={`struct-row ${i === editingLocIdx ? 'row-active' : ''}`}
              onClick={() => setEditingLocIdx(i)}
            >
              <span className="row-id">{l.id}</span>
              <span className="row-name">{l.name}</span>
              <span className="row-tag">{TYPE_LABELS[l.type] || l.type}</span>
            </div>
          ))}
          {locations.length === 0 && (
            <div className="empty-state py-3">
              <p>暂无地点，点击「+ 添加地点」创建</p>
            </div>
          )}
        </div>

        {loc && (
          <div className="edit-form">
            <div className="edit-form-row">
              <label>名称</label>
              <input value={loc.name} onChange={e => updateLocation(editingLocIdx, { name: e.target.value })} />
            </div>
            <div className="edit-form-row">
              <label>类型</label>
              <select value={loc.type} onChange={e => updateLocation(editingLocIdx, { type: e.target.value })}>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="edit-form-row">
              <label>时代</label>
              <input value={loc.era || ''} onChange={e => updateLocation(editingLocIdx, { era: e.target.value })} placeholder="如：现代·遗迹" />
            </div>
            <div className="edit-form-row">
              <label>氛围</label>
              <input value={loc.mood || ''} onChange={e => updateLocation(editingLocIdx, { mood: e.target.value })} placeholder="如：阴冷潮湿，暗藏秘密" />
            </div>
            <div className="edit-form-row">
              <label>特征</label>
              <textarea rows={2} value={loc.features || ''} onChange={e => updateLocation(editingLocIdx, { features: e.target.value })} placeholder="地点独有特征描述" />
            </div>
            <div className="edit-form-row">
              <label>连接 (逗号分隔)</label>
              <input value={(loc.connectedTo || []).join(', ')} onChange={e => updateLocation(editingLocIdx, { connectedTo: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="如：雾隐镇, 护林站" />
            </div>
            <button className="btn btn-ghost btn-sm mt-2" onClick={() => deleteLocation(editingLocIdx)}>删除此地</button>
          </div>
        )}
      </div>
    </div>
  )
}
