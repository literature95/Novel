import { useState, useMemo } from 'react'
import { useNovel } from '../../store'
import { detectCollaborationConflicts, PLOT_LINE_KEYS } from '../../lib/collaboration'

export default function CollaborationSyncPanel() {
  const {
    collaboration,
    project,
    addSyncLog,
    updateSyncLog,
    deleteSyncLog,
    completeNode,
    updateCollaboration,
  } = useNovel()

  const [syncIdx, setSyncIdx] = useState(0)
  const logs = collaboration.syncLog || []
  const entry = logs[syncIdx]
  const conflicts = useMemo(() => detectCollaborationConflicts(project), [project])

  const toggleSyncedLine = (index, lineId) => {
    const item = logs[index]
    if (!item) return
    const lines = item.syncedLines || []
    const next = lines.includes(lineId) ? lines.filter(id => id !== lineId) : [...lines, lineId]
    updateSyncLog(index, { syncedLines: next })
  }

  return (
    <div className="struct-section edit-panel sync-panel">
      <div className="struct-section-header">
        <h3>协同同步 · N-6.3</h3>
        <span className={`badge ${conflicts.some(c => c.type === 'error') ? 'badge-error' : 'badge-done'}`}>
          {conflicts.length ? `${conflicts.length} 项提示` : '无冲突'}
        </span>
      </div>

      {collaboration.mode !== 'team' && (
        <p className="panel-hint">
          当前为单人模式，N-6.3 在工作流中为 <code>skip</code>。切换至「多人协同」后可记录同步日志并标记完成。
          <button type="button" className="btn btn-ghost btn-sm" style={{ marginLeft: 8 }} onClick={() => updateCollaboration({ mode: 'team' })}>
            启用多人协同
          </button>
        </p>
      )}

      {conflicts.length > 0 && (
        <ul className="sync-conflict-list">
          {conflicts.map((c, i) => (
            <li key={i} className={c.type === 'error' ? 'issue-error' : 'issue-warn'}>{c.message}</li>
          ))}
        </ul>
      )}

      <div className="collab-toolbar">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { addSyncLog(); setSyncIdx(logs.length) }}>+ 添加同步记录</button>
        {collaboration.mode === 'team' && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => completeNode('N-6.3')}>
            标记 N-6.3 完成
          </button>
        )}
      </div>

      <div className="sync-log-list">
        {logs.map((log, i) => (
          <div
            key={log.id}
            role="button"
            tabIndex={0}
            className={`sync-log-card ${i === syncIdx ? 'sync-log-card-active' : ''}`}
            onClick={() => setSyncIdx(i)}
            onKeyDown={e => e.key === 'Enter' && setSyncIdx(i)}
          >
            <span className="sync-log-id">{log.id}</span>
            <span className="sync-log-date">{log.date}</span>
            <span className="sync-log-lines">
              {(log.syncedLines || []).map(id => PLOT_LINE_KEYS.find(p => p.id === id)?.name || id).join(' · ') || '未选线'}
            </span>
            {log.conflictNotes?.trim() && <span className="sync-log-warn">⚠ 有冲突备注</span>}
          </div>
        ))}
        {logs.length === 0 && <p className="panel-hint">暂无同步记录。</p>}
      </div>

      {entry && (
        <div className="edit-form">
          <h4 className="edit-form-title">编辑同步 · {entry.id}</h4>
          <div className="edit-form-grid">
            <label>
              日期
              <input type="date" className="text-input" value={entry.date || ''} onChange={e => updateSyncLog(syncIdx, { date: e.target.value })} />
            </label>
            <label className="edit-span-2">
              已同步叙事线
              <div className="chip-row">
                {PLOT_LINE_KEYS.map(line => (
                  <button
                    key={line.id}
                    type="button"
                    className={`chip-btn ${(entry.syncedLines || []).includes(line.id) ? 'active' : ''}`}
                    onClick={() => toggleSyncedLine(syncIdx, line.id)}
                  >
                    {line.name}
                  </button>
                ))}
              </div>
            </label>
            <label className="edit-span-2">
              冲突 / 备注
              <textarea
                className="text-input edit-textarea"
                rows={3}
                value={entry.conflictNotes || ''}
                onChange={e => updateSyncLog(syncIdx, { conflictNotes: e.target.value })}
                placeholder="记录多作者之间的情节冲突或待协调事项"
              />
            </label>
          </div>
          <div className="edit-form-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteSyncLog(syncIdx)}>删除记录</button>
          </div>
        </div>
      )}
    </div>
  )
}
