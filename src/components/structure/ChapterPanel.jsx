import { useNovel } from '../../store'

const STATUS_OPTIONS = [
  { value: 'locked', label: '待解锁' },
  { value: 'progress', label: '写作中' },
  { value: 'done', label: '已完成' },
]

const PLOT_LINE_OPTIONS = [
  { id: 'main_line', name: '主线' },
  { id: 'relationship_arc', name: '感情线' },
  { id: 'antagonist_arc', name: '反派线' },
  { id: 'world_arc', name: '世界观' },
  { id: 'thematic_arc', name: '主题线' },
]

export default function ChapterPanel() {
  const {
    chapters,
    plotLines,
    characters,
    editingChapterIdx,
    setEditingChapterIdx,
    addChapter,
    updateChapter,
    deleteChapter,
  } = useNovel()

  const ch = chapters[editingChapterIdx]

  const togglePlotLine = (index, lineId) => {
    const current = ch.plotLines || []
    const has = current.includes(lineId)
    const next = has ? current.filter(id => id !== lineId) : [...current, lineId]
    updateChapter(index, { plotLines: next })
  }

  return (
    <div className="struct-section edit-panel">
      <div className="struct-section-header">
        <h3>章节大纲 · {chapters.length} 章</h3>
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={addChapter}>+ 添加章节</button>
        </div>
      </div>

      <div className="chapter-edit-grid">
        {chapters.map((chapter, i) => {
          const borderColor = chapter.status === 'done'
            ? 'var(--color-success)'
            : chapter.status === 'progress'
              ? 'var(--color-warning)'
              : 'var(--color-text-muted)'
          return (
            <div
              key={chapter.id}
              role="button"
              tabIndex={0}
              onClick={() => setEditingChapterIdx(i)}
              onKeyDown={e => e.key === 'Enter' && setEditingChapterIdx(i)}
              className={`chapter-edit-card ${i === editingChapterIdx ? 'chapter-edit-active' : ''}`}
              style={{ borderLeftColor: borderColor }}
            >
              <div className="chapter-edit-header">
                <span className="ch-edit-id">Ch{chapter.id}</span>
                <span className="ch-edit-title">{chapter.title}</span>
              </div>
              <div className="chapter-edit-meta">
                <span>{chapter.words}/{chapter.targetWords}字</span>
                <span>{chapter.scenes}场景</span>
              </div>
            </div>
          )
        })}
      </div>

      {ch && (
        <div className="edit-form">
          <h4 className="edit-form-title">编辑章节 Ch{ch.id}</h4>
          <div className="edit-form-grid">
            <label className="edit-span-2">
              标题
              <input
                className="text-input"
                value={ch.title}
                onChange={e => updateChapter(editingChapterIdx, { title: e.target.value })}
              />
            </label>
            <label>
              状态
              <select
                className="select-input"
                value={ch.status}
                onChange={e => updateChapter(editingChapterIdx, { status: e.target.value })}
              >
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>
            <label>
              目标字数
              <input
                type="number"
                className="text-input"
                value={ch.targetWords}
                onChange={e => updateChapter(editingChapterIdx, { targetWords: parseInt(e.target.value) || 0 })}
              />
            </label>
            <label>
              节奏动量
              <input
                type="number"
                min={0}
                max={1}
                step={0.1}
                className="text-input"
                value={ch.momentum}
                onChange={e => updateChapter(editingChapterIdx, { momentum: parseFloat(e.target.value) || 0 })}
              />
            </label>
            <label>
              情感峰值
              <input
                type="number"
                min={0}
                max={1}
                step={0.1}
                className="text-input"
                value={ch.emotionPeak}
                onChange={e => updateChapter(editingChapterIdx, { emotionPeak: parseFloat(e.target.value) || 0 })}
              />
            </label>
            <label className="edit-span-2">
              叙事线分配
              <div className="plotline-toggles">
                {PLOT_LINE_OPTIONS.map(pl => {
                  const isActive = (ch.plotLines || []).includes(pl.id)
                  const plData = plotLines.find(p => p.id === pl.id)
                  return (
                    <button
                      key={pl.id}
                      type="button"
                      className={`plotline-toggle ${isActive ? 'active' : ''}`}
                      style={{ borderColor: isActive && plData ? `var(--color-${plData.color})` : undefined, background: isActive && plData ? `rgba(${plData.color === 'cerulean' ? '41,128,166' : plData.color === 'rose' ? '196,72,96' : plData.color === 'crimson' ? '196,107,107' : plData.color === 'olive' ? '155,152,78' : '212,168,83'}, 0.15)` : undefined }}
                      onClick={() => togglePlotLine(editingChapterIdx, pl.id)}
                    >
                      {pl.name}
                    </button>
                  )
                })}
              </div>
            </label>
          </div>
          <div className="edit-form-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteChapter(editingChapterIdx)}>
              删除章节
            </button>
          </div>
        </div>
      )}
    </div>
  )
}