import { useNovel } from '../../store'

const SIG_COLORS = { 高: 'var(--color-crimson)', 中: 'var(--color-ochre)', 低: 'var(--color-text-muted)' }

export default function TimelinePanel() {
  const {
    timeline = [],
    editingTimelineIdx,
    setEditingTimelineIdx,
    addTimelineEvent,
    updateTimelineEvent,
    deleteTimelineEvent,
    locations = [],
    characters = [],
  } = useNovel()

  const t = timeline[editingTimelineIdx]

  const eras = [...new Set(timeline.filter(e => e.era).map(e => e.era))]

  const sorted = [...timeline].sort((a, b) => {
    const na = parseInt(a.year) || 0
    const nb = parseInt(b.year) || 0
    return na - nb
  })

  return (
    <div className="struct-section edit-panel">
      <div className="struct-section-header">
        <h3>时间线 · N-1.4 · {timeline.length} 个事件</h3>
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={addTimelineEvent}>+ 添加事件</button>
        </div>
      </div>

      <div className="edit-layout">
        <div className="edit-list">
          {sorted.map((e) => {
            const idx = timeline.indexOf(e)
            return (
              <div
                key={e.id}
                className={`timeline-row ${idx === editingTimelineIdx ? 'row-active' : ''}`}
                onClick={() => setEditingTimelineIdx(idx)}
              >
                <span className="row-id" style={{ color: SIG_COLORS[e.significance] || 'inherit' }}>{e.year}</span>
                <span className="row-name">{e.event}</span>
                {e.era && <span className="row-tag">{e.era}</span>}
                <span className="row-sig" style={{ color: SIG_COLORS[e.significance] || 'inherit' }}>
                  {e.significance === '高' ? '◆◆' : e.significance === '中' ? '◆◇' : '◇◇'}
                </span>
              </div>
            )
          })}
          {timeline.length === 0 && (
            <div className="empty-state py-3">
              <p>暂时间线事件，点击「+ 添加事件」创建</p>
            </div>
          )}
        </div>

        {t && (
          <div className="edit-form">
            <div className="edit-form-row">
              <label>年代</label>
              <input value={t.year || ''} onChange={e => updateTimelineEvent(editingTimelineIdx, { year: e.target.value })} placeholder="如：2005年" />
            </div>
            <div className="edit-form-row">
              <label>事件</label>
              <input value={t.event} onChange={e => updateTimelineEvent(editingTimelineIdx, { event: e.target.value })} />
            </div>
            <div className="edit-form-row">
              <label>时代标签</label>
              <div className="flex gap-2">
                <input
                  value={t.era || ''}
                  onChange={e => updateTimelineEvent(editingTimelineIdx, { era: e.target.value })}
                  placeholder="如：矿业时代"
                />
                {eras.map(era => (
                  <button
                    key={era}
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => updateTimelineEvent(editingTimelineIdx, { era })}
                  >{era}</button>
                ))}
              </div>
            </div>
            <div className="edit-form-row">
              <label>重要性</label>
              <select value={t.significance} onChange={e => updateTimelineEvent(editingTimelineIdx, { significance: e.target.value })}>
                <option value="高">◆◆ 高</option>
                <option value="中">◆◇ 中</option>
                <option value="低">◇◇ 低</option>
              </select>
            </div>
            <div className="edit-form-row">
              <label>涉及角色 (逗号分隔)</label>
              <div className="flex gap-2 flex-wrap">
                {characters.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    className={`btn btn-ghost btn-xs ${(t.characters || []).includes(c.name) ? 'btn-active' : ''}`}
                    onClick={() => {
                      const cur = t.characters || []
                      const next = cur.includes(c.name) ? cur.filter(n => n !== c.name) : [...cur, c.name]
                      updateTimelineEvent(editingTimelineIdx, { characters: next })
                    }}
                  >{c.name}</button>
                ))}
              </div>
            </div>
            <div className="edit-form-row">
              <label>涉及地点 (逗号分隔)</label>
              <div className="flex gap-2 flex-wrap">
                {(locations || []).map(l => (
                  <button
                    key={l.id}
                    type="button"
                    className={`btn btn-ghost btn-xs ${(t.locations || []).includes(l.name) ? 'btn-active' : ''}`}
                    onClick={() => {
                      const cur = t.locations || []
                      const next = cur.includes(l.name) ? cur.filter(n => n !== l.name) : [...cur, l.name]
                      updateTimelineEvent(editingTimelineIdx, { locations: next })
                    }}
                  >{l.name}</button>
                ))}
              </div>
            </div>
            <button className="btn btn-ghost btn-sm mt-2" onClick={() => deleteTimelineEvent(editingTimelineIdx)}>删除此事件</button>
          </div>
        )}
      </div>
    </div>
  )
}
