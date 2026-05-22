import { useState } from 'react'
import { useNovel } from '../../store'
import {
  ASSIGNMENT_STATUS,
  PLOT_LINE_KEYS,
  writerName,
} from '../../lib/collaboration'

const TABS = [
  { id: 'writers', label: '作者' },
  { id: 'chapters', label: '章节归属' },
  { id: 'handover', label: '交接日志' },
]

export default function CollaborationPanel() {
  const {
    collaboration,
    chapters,
    updateCollaboration,
    addWriter,
    updateWriter,
    deleteWriter,
    setChapterAssignment,
    removeChapterAssignment,
    addHandover,
    updateHandover,
    deleteHandover,
    completeNode,
  } = useNovel()

  const mode = collaboration.mode ?? 'solo'
  const [tab, setTab] = useState('writers')
  const [writerIdx, setWriterIdx] = useState(0)
  const [handoverIdx, setHandoverIdx] = useState(0)

  const writers = collaboration.writers || []
  const assignments = collaboration.chapterAssignments || []
  const handovers = collaboration.handoverNotes || []
  const w = writers[writerIdx]
  const h = handovers[handoverIdx]

  const getAssignment = chapterId =>
    assignments.find(a => a.chapterId === chapterId)

  const toggleWriterLine = (index, lineId) => {
    const wr = writers[index]
    if (!wr) return
    const lines = wr.responsibleLines || []
    const next = lines.includes(lineId)
      ? lines.filter(id => id !== lineId)
      : [...lines, lineId]
    updateWriter(index, { responsibleLines: next })
  }

  return (
    <div className="struct-section edit-panel collab-panel">
      <div className="struct-section-header">
        <h3>协同面板 · N-3.1</h3>
        <span className={`badge ${mode === 'team' ? 'badge-progress' : 'badge-locked'}`}>
          {mode === 'team' ? '多人协同' : '单人（节点跳过）'}
        </span>
      </div>

      <div className="collab-mode-row">
        <label className={`collab-mode-opt ${mode === 'solo' ? 'active' : ''}`}>
          <input
            type="radio"
            name="collab-mode"
            checked={mode === 'solo'}
            onChange={() => updateCollaboration({ mode: 'solo' })}
          />
          单人创作
        </label>
        <label className={`collab-mode-opt ${mode === 'team' ? 'active' : ''}`}>
          <input
            type="radio"
            name="collab-mode"
            checked={mode === 'team'}
            onChange={() => updateCollaboration({ mode: 'team' })}
          />
          多人协同
        </label>
        {mode === 'team' && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => completeNode('N-3.1')}>
            标记 N-3.1 完成
          </button>
        )}
      </div>

      <label className="collab-notes-label">
        分工总述
        <textarea
          className="text-input edit-textarea"
          rows={2}
          value={collaboration.notes || ''}
          onChange={e => updateCollaboration({ notes: e.target.value })}
        />
      </label>

      <div className="collab-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            className={`collab-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            <span className="collab-tab-count">
              {t.id === 'writers' && writers.length}
              {t.id === 'chapters' && assignments.length}
              {t.id === 'handover' && handovers.length}
            </span>
          </button>
        ))}
      </div>

      {tab === 'writers' && (
        <>
          <div className="collab-toolbar">
            <button type="button" className="btn btn-ghost btn-sm" onClick={addWriter}>+ 添加作者</button>
          </div>
          <div className="writer-grid">
            {writers.map((wr, i) => (
              <div
                key={wr.id}
                role="button"
                tabIndex={0}
                className={`writer-card ${i === writerIdx ? 'writer-card-active' : ''}`}
                style={{ borderLeftColor: `var(--color-${wr.color || 'cerulean'})` }}
                onClick={() => setWriterIdx(i)}
                onKeyDown={e => e.key === 'Enter' && setWriterIdx(i)}
              >
                <span className="writer-name">{wr.name}</span>
                <span className="writer-lines">
                  {(wr.responsibleLines || []).map(id => PLOT_LINE_KEYS.find(p => p.id === id)?.name || id).join(' · ') || '未分配线条'}
                </span>
              </div>
            ))}
            {writers.length === 0 && (
              <p className="panel-hint">暂无作者，点击「添加作者」或切换为多人协同自动填充示例。</p>
            )}
          </div>
          {w && (
            <div className="edit-form">
              <h4 className="edit-form-title">编辑作者 · {w.id}</h4>
              <div className="edit-form-grid">
                <label>
                  姓名
                  <input className="text-input" value={w.name} onChange={e => updateWriter(writerIdx, { name: e.target.value })} />
                </label>
                <label>
                  标识色
                  <select className="select-input" value={w.color || 'cerulean'} onChange={e => updateWriter(writerIdx, { color: e.target.value })}>
                    {['cerulean', 'rose', 'crimson', 'olive', 'ochre', 'amber'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className="edit-span-2">
                  负责叙事线
                  <div className="chip-row">
                    {PLOT_LINE_KEYS.map(line => (
                      <button
                        key={line.id}
                        type="button"
                        className={`chip-btn ${(w.responsibleLines || []).includes(line.id) ? 'active' : ''}`}
                        onClick={() => toggleWriterLine(writerIdx, line.id)}
                      >
                        {line.name}
                      </button>
                    ))}
                  </div>
                </label>
              </div>
              <div className="edit-form-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteWriter(writerIdx)}>删除作者</button>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'chapters' && (
        <>
          <p className="panel-hint">为每章指定主笔与协作者（对齐 v2.0 <code>chapter_assignment</code>）。</p>
          <div className="collab-table-wrap">
            <table className="collab-table">
              <thead>
                <tr>
                  <th>章节</th>
                  <th>主笔</th>
                  <th>协作者</th>
                  <th>状态</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {chapters.map(ch => {
                  const a = getAssignment(ch.id) || { chapterId: ch.id, primaryWriterId: '', collaboratorIds: [], status: 'draft' }
                  return (
                    <tr key={ch.id}>
                      <td>
                        <span className="ch-edit-id">Ch{ch.id}</span> {ch.title}
                      </td>
                      <td>
                        <select
                          className="select-input select-input-sm"
                          value={a.primaryWriterId || ''}
                          onChange={e => setChapterAssignment(ch.id, { primaryWriterId: e.target.value })}
                        >
                          <option value="">—</option>
                          {writers.map(wr => (
                            <option key={wr.id} value={wr.id}>{wr.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          className="select-input select-input-sm"
                          multiple
                          value={a.collaboratorIds || []}
                          onChange={e => {
                            const opts = [...e.target.selectedOptions].map(o => o.value)
                            setChapterAssignment(ch.id, { collaboratorIds: opts })
                          }}
                          size={Math.min(3, writers.length || 1)}
                        >
                          {writers.filter(wr => wr.id !== a.primaryWriterId).map(wr => (
                            <option key={wr.id} value={wr.id}>{wr.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          className="select-input select-input-sm"
                          value={a.status || 'draft'}
                          onChange={e => setChapterAssignment(ch.id, { status: e.target.value })}
                        >
                          {ASSIGNMENT_STATUS.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        {getAssignment(ch.id) && (
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeChapterAssignment(ch.id)}>清除</button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'handover' && (
        <>
          <div className="collab-toolbar">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { addHandover(); setHandoverIdx(handovers.length) }}>+ 添加交接</button>
          </div>
          <div className="handover-list">
            {handovers.map((note, i) => (
              <div
                key={note.id}
                role="button"
                tabIndex={0}
                className={`handover-card ${i === handoverIdx ? 'handover-card-active' : ''}`}
                onClick={() => setHandoverIdx(i)}
                onKeyDown={e => e.key === 'Enter' && setHandoverIdx(i)}
              >
                <span className="handover-route">
                  {writerName(writers, note.fromWriterId)} → {writerName(writers, note.toWriterId)}
                </span>
                <span className="handover-ch">Ch{note.chapterId ?? '—'}</span>
                <p className="handover-preview">{note.content || '（无内容）'}</p>
              </div>
            ))}
          </div>
          {h && (
            <div className="edit-form">
              <h4 className="edit-form-title">编辑交接 · {h.id}</h4>
              <div className="edit-form-grid">
                <label>
                  交出方
                  <select className="select-input" value={h.fromWriterId || ''} onChange={e => updateHandover(handoverIdx, { fromWriterId: e.target.value })}>
                    <option value="">—</option>
                    {writers.map(wr => <option key={wr.id} value={wr.id}>{wr.name}</option>)}
                  </select>
                </label>
                <label>
                  接收方
                  <select className="select-input" value={h.toWriterId || ''} onChange={e => updateHandover(handoverIdx, { toWriterId: e.target.value })}>
                    <option value="">—</option>
                    {writers.map(wr => <option key={wr.id} value={wr.id}>{wr.name}</option>)}
                  </select>
                </label>
                <label>
                  章节
                  <select className="select-input" value={h.chapterId ?? ''} onChange={e => updateHandover(handoverIdx, { chapterId: Number(e.target.value) })}>
                    <option value="">—</option>
                    {chapters.map(ch => <option key={ch.id} value={ch.id}>Ch{ch.id} {ch.title}</option>)}
                  </select>
                </label>
                <label>
                  日期
                  <input type="date" className="text-input" value={h.date || ''} onChange={e => updateHandover(handoverIdx, { date: e.target.value })} />
                </label>
                <label className="edit-span-2">
                  交接内容
                  <textarea className="text-input edit-textarea" rows={3} value={h.content || ''} onChange={e => updateHandover(handoverIdx, { content: e.target.value })} />
                </label>
              </div>
              <div className="edit-form-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteHandover(handoverIdx)}>删除记录</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
