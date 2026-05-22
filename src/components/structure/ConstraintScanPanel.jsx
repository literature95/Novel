import { useNovel } from '../../store'

export default function ConstraintScanPanel() {
  const { globalScan, setView, selectChapter, chapters } = useNovel()
  const scan = globalScan

  const jumpToScene = (entry) => {
    const chIdx = chapters.findIndex(c => c.id === entry.chapterId)
    if (chIdx < 0) return
    setView('content')
    selectChapter(chIdx)
  }

  return (
    <div className="struct-section scan-panel">
      <div className="struct-section-header">
        <h3>约束扫描 · N-6.2</h3>
        <span className={`badge ${scan.passed ? 'badge-done' : 'badge-error'}`}>
          {scan.passed ? '通过' : `${scan.errorCount} 错误`}
        </span>
      </div>
      <div className="scan-summary-row">
        <div className="scan-stat">
          <span className="scan-stat-num">{scan.totalScenes}</span>
          <span className="scan-stat-label">场景总数</span>
        </div>
        <div className="scan-stat">
          <span className="scan-stat-num">{scan.flaggedCount}</span>
          <span className="scan-stat-label">需关注</span>
        </div>
        <div className="scan-stat">
          <span className="scan-stat-num">{scan.warningCount}</span>
          <span className="scan-stat-label">警告</span>
        </div>
      </div>
      {scan.entries.length === 0 ? (
        <p className="panel-hint success-hint">✓ 全部场景校验通过，无违规记录。</p>
      ) : (
        <ul className="scan-issue-list">
          {scan.entries.map(entry => (
            <li key={`${entry.chapterId}-${entry.sceneIndex}`} className="scan-issue-item">
              <button type="button" className="scan-issue-link" onClick={() => jumpToScene(entry)}>
                <span className="scan-issue-loc">
                  Ch{entry.chapterId} · {entry.sceneId || `场景${entry.sceneIndex + 1}`}
                </span>
                <span className="scan-issue-pov">POV {entry.pov}</span>
              </button>
              <ul className="scan-issue-msgs">
                {entry.issues.map((issue, i) => (
                  <li key={i} className={issue.level === 'error' ? 'issue-error' : 'issue-warn'}>
                    {issue.ruleId && <code>{issue.ruleId}</code>} {issue.message}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
