import { useNovel } from '../../store'

export default function VolumePanel() {
  const {
    volumes = [],
    editingVolumeIdx,
    setEditingVolumeIdx,
    addVolume,
    updateVolume,
    deleteVolume,
  } = useNovel()

  const v = volumes[editingVolumeIdx]

  return (
    <div className="struct-section edit-panel">
      <div className="struct-section-header">
        <h3>分册骨架 · N-4.1 · {volumes.length} 册</h3>
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={addVolume}>+ 添加分册</button>
        </div>
      </div>

      <div className="volume-list">
        {volumes.map((vol, i) => (
          <div
            key={vol.id}
            role="button"
            tabIndex={0}
            onClick={() => setEditingVolumeIdx(i)}
            onKeyDown={e => e.key === 'Enter' && setEditingVolumeIdx(i)}
            className={`volume-card ${i === editingVolumeIdx ? 'rule-item-active' : ''}`}
          >
            <div className="volume-header">
              <span className="volume-id">{vol.id}</span>
              <span className="volume-name">{vol.name}</span>
            </div>
            <div className="volume-range">{vol.range}</div>
            <div className="volume-markers">
              <span className="marker-hook">钩子: {vol.hook || '-'}</span>
              <span className="marker-midpoint">中点: {vol.midpoint || '-'}</span>
              <span className="marker-climax">高潮: {vol.climax || '-'}</span>
            </div>
            <div className="volume-desc">{vol.desc}</div>
          </div>
        ))}
      </div>

      {v && (
        <div className="edit-form">
          <h4 className="edit-form-title">编辑分册 {v.id}</h4>
          <div className="edit-form-grid">
            <label>
              分册 ID
              <input className="text-input" value={v.id} readOnly />
            </label>
            <label>
              名称
              <input
                className="text-input"
                value={v.name}
                onChange={e => updateVolume(editingVolumeIdx, { name: e.target.value })}
              />
            </label>
            <label>
              章节范围
              <input
                className="text-input"
                value={v.range}
                onChange={e => updateVolume(editingVolumeIdx, { range: e.target.value })}
                placeholder="Ch1–Ch20"
              />
            </label>
            <label>
              章节列表
              <input
                className="text-input"
                value={v.chapters.join(',')}
                onChange={e => {
                  const nums = e.target.value.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n))
                  updateVolume(editingVolumeIdx, { chapters: nums })
                }}
                placeholder="1,2,3,4,5"
              />
            </label>
            <label>
              钩子章节
              <input
                className="text-input"
                value={v.hook}
                onChange={e => updateVolume(editingVolumeIdx, { hook: e.target.value })}
                placeholder="Ch1"
              />
            </label>
            <label>
              中点章节
              <input
                className="text-input"
                value={v.midpoint}
                onChange={e => updateVolume(editingVolumeIdx, { midpoint: e.target.value })}
                placeholder="Ch10"
              />
            </label>
            <label>
              高潮章节
              <input
                className="text-input"
                value={v.climax}
                onChange={e => updateVolume(editingVolumeIdx, { climax: e.target.value })}
                placeholder="Ch18"
              />
            </label>
            <label className="edit-span-2">
              描述
              <textarea
                className="text-input edit-textarea"
                value={v.desc}
                onChange={e => updateVolume(editingVolumeIdx, { desc: e.target.value })}
                rows={2}
              />
            </label>
          </div>
          <div className="edit-form-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteVolume(editingVolumeIdx)}>
              删除分册
            </button>
          </div>
        </div>
      )}
    </div>
  )
}