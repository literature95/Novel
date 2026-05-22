import { useNovel } from '../../store'

export default function ActPlotPanel() {
  const { acts, plotLines, updateAct, updatePlotLine } = useNovel()

  return (
    <div className="two-col-grid act-plot-grid">
      <div className="struct-card act-plot-card">
        <div className="card-header">
          <span className="card-title">三幕结构 · N-2.1</span>
        </div>
        {acts.map((act, i) => (
          <div key={act.name} className="act-edit-row">
            <div className="act-edit-head">
              <input
                className="text-input"
                value={act.name}
                onChange={e => updateAct(i, { name: e.target.value })}
              />
              <input
                className="text-input act-range-input"
                value={act.range}
                onChange={e => updateAct(i, { range: e.target.value })}
                placeholder="0–25%"
              />
            </div>
            <textarea
              className="text-input edit-textarea"
              rows={2}
              value={act.goal}
              onChange={e => updateAct(i, { goal: e.target.value })}
              placeholder="本幕目标"
            />
            <input
              className="text-input"
              value={act.curve || ''}
              onChange={e => updateAct(i, { curve: e.target.value })}
              placeholder="情感曲线"
            />
          </div>
        ))}
      </div>
      <div className="struct-card act-plot-card">
        <div className="card-header">
          <span className="card-title">五线规划 · N-2.2</span>
        </div>
        {plotLines.map((l, i) => (
          <div key={l.id} className="plot-edit-row">
            <div className="plot-edit-head">
              <span className="prog-label" style={{ color: `var(--color-${l.color})` }}>{l.name}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round((l.progress || 0) * 100)}
                onChange={e => updatePlotLine(i, { progress: Number(e.target.value) / 100 })}
              />
              <span className="prog-value">{Math.round((l.progress || 0) * 100)}%</span>
            </div>
            <input
              className="text-input"
              value={l.milestone || ''}
              onChange={e => updatePlotLine(i, { milestone: e.target.value })}
              placeholder="当前里程碑"
            />
            <input
              className="text-input"
              value={l.description || ''}
              onChange={e => updatePlotLine(i, { description: e.target.value })}
              placeholder="线条描述"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
