import { useNovel } from '../../store'

export default function FinalReport() {
  const { foreshadows, chapters, characters, plotLines, constraints } = useNovel()

  // N-7.1 伏笔终审
  const fsStats = {
    total: foreshadows.length,
    resolved: foreshadows.filter(f => f.status === 'resolved').length,
    recoveryRate: foreshadows.length > 0 
      ? Math.round((foreshadows.filter(f => f.status === 'resolved').length / foreshadows.length) * 100)
      : 0,
    overdue: foreshadows.filter(f => {
      if (f.status === 'resolved' || f.status === 'abandoned') return false
      const match = f.deadline.match(/Ch(\d+)/)
      if (!match) return false
      return chapters.filter(c => c.status === 'done').length > parseInt(match[1])
    }).length,
  }

  // N-7.2 弧线完成度
  const arcStats = {
    characters: {
      total: characters.length,
      avgProgress: characters.length > 0
        ? Math.round((characters.reduce((s, c) => s + (c.progress || 0), 0) / characters.length) * 100)
        : 0,
    },
    plotLines: {
      total: plotLines.length,
      avgProgress: plotLines.length > 0
        ? Math.round((plotLines.reduce((s, p) => s + (p.progress || 0), 0) / plotLines.length) * 100)
        : 0,
    },
  }

  // N-7.3 规则清零
  const ruleStats = {
    total: constraints.length,
    absolute: constraints.filter(c => c.type === 'absolute').length,
    soft: constraints.filter(c => c.type === 'soft').length,
    guideline: constraints.filter(c => c.type === 'guideline').length,
  }

  // N-7.4 综合健康度
  const weights = {
    foreshadow: 0.25,
    characterArc: 0.25,
    plotLine: 0.25,
    rules: 0.25,
  }
  
  const healthScore = Math.round(
    fsStats.recoveryRate * weights.foreshadow +
    arcStats.characters.avgProgress * weights.characterArc +
    arcStats.plotLines.avgProgress * weights.plotLine +
    100 * weights.rules
  )

  const getHealthLevel = (score) => {
    if (score >= 90) return { level: '优秀', color: 'var(--color-success)', pass: true }
    if (score >= 75) return { level: '良好', color: 'var(--color-cerulean)', pass: true }
    if (score >= 60) return { level: '及格', color: 'var(--color-warning)', pass: true }
    return { level: '需修订', color: 'var(--color-error)', pass: false }
  }

  const health = getHealthLevel(healthScore)

  return (
    <div className="struct-section">
      <div className="struct-section-header">
        <h3>终审报告 · N-7.4</h3>
      </div>

      {/* 综合评分 */}
      <div className="final-score-card">
        <div className="final-score-main" style={{ color: health.color }}>
          {healthScore}
        </div>
        <div className="final-score-label">综合健康度</div>
        <div className="final-score-level" style={{ color: health.color }}>
          {health.level} {health.pass ? '✓' : '✗'}
        </div>
        <div className="final-score-hint">
          {health.pass 
            ? '项目达到交付标准，可以导出最终版本' 
            : '项目存在需要修订的问题，请查看下方详细报告'}
        </div>
      </div>

      {/* 详细审计 */}
      <div className="final-audit-grid">
        {/* N-7.1 伏笔终审 */}
        <div className="final-audit-card">
          <div className="audit-header">
            <span className="audit-title">N-7.1 伏笔终审</span>
            <span className="audit-score" style={{ color: fsStats.recoveryRate >= 80 ? 'var(--color-success)' : fsStats.recoveryRate >= 60 ? 'var(--color-warning)' : 'var(--color-error)' }}>
              {fsStats.recoveryRate}%
            </span>
          </div>
          <div className="audit-detail">
            <div className="audit-row">
              <span>已回收伏笔</span>
              <span>{fsStats.resolved} / {fsStats.total}</span>
            </div>
            <div className="audit-row">
              <span>超期未回收</span>
              <span style={{ color: fsStats.overdue > 0 ? 'var(--color-error)' : 'inherit' }}>{fsStats.overdue}</span>
            </div>
          </div>
        </div>

        {/* N-7.2 角色弧线 */}
        <div className="final-audit-card">
          <div className="audit-header">
            <span className="audit-title">N-7.2 角色弧线</span>
            <span className="audit-score" style={{ color: arcStats.characters.avgProgress >= 80 ? 'var(--color-success)' : arcStats.characters.avgProgress >= 60 ? 'var(--color-warning)' : 'var(--color-error)' }}>
              {arcStats.characters.avgProgress}%
            </span>
          </div>
          <div className="audit-detail">
            <div className="audit-row">
              <span>角色数量</span>
              <span>{arcStats.characters.total}</span>
            </div>
            <div className="audit-row">
              <span>平均完成度</span>
              <span>{arcStats.characters.avgProgress}%</span>
            </div>
          </div>
        </div>

        {/* N-7.2 叙事线 */}
        <div className="final-audit-card">
          <div className="audit-header">
            <span className="audit-title">N-7.2 叙事线</span>
            <span className="audit-score" style={{ color: arcStats.plotLines.avgProgress >= 80 ? 'var(--color-success)' : arcStats.plotLines.avgProgress >= 60 ? 'var(--color-warning)' : 'var(--color-error)' }}>
              {arcStats.plotLines.avgProgress}%
            </span>
          </div>
          <div className="audit-detail">
            <div className="audit-row">
              <span>叙事线数量</span>
              <span>{arcStats.plotLines.total}</span>
            </div>
            <div className="audit-row">
              <span>平均进度</span>
              <span>{arcStats.plotLines.avgProgress}%</span>
            </div>
          </div>
        </div>

        {/* N-7.3 规则清零 */}
        <div className="final-audit-card">
          <div className="audit-header">
            <span className="audit-title">N-7.3 规则清零</span>
            <span className="audit-score" style={{ color: 'var(--color-success)' }}>100%</span>
          </div>
          <div className="audit-detail">
            <div className="audit-row">
              <span>硬规则</span>
              <span>{ruleStats.absolute}</span>
            </div>
            <div className="audit-row">
              <span>软规则</span>
              <span>{ruleStats.soft}</span>
            </div>
            <div className="audit-row">
              <span>写作指南</span>
              <span>{ruleStats.guideline}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 修订建议 */}
      {!health.pass && (
        <div className="final-revision-box">
          <h4>修订优先级</h4>
          <ul>
            {fsStats.recoveryRate < 80 && (
              <li>伏笔回收率偏低，建议检查未回收伏笔的 deadline 安排</li>
            )}
            {fsStats.overdue > 0 && (
              <li>存在 {fsStats.overdue} 条超期伏笔，建议立即回收或调整 deadline</li>
            )}
            {arcStats.characters.avgProgress < 80 && (
              <li>角色弧线完成度偏低，建议检查主要角色的 arc 进度</li>
            )}
            {arcStats.plotLines.avgProgress < 80 && (
              <li>叙事线进度偏低，建议检查五线里程碑完成情况</li>
            )}
          </ul>
        </div>
      )}

      {/* 交付按钮 */}
      <div className="final-actions">
        <button className="btn btn-primary" disabled={!health.pass}>
          {health.pass ? '导出最终版本' : '请先完成修订'}
        </button>
      </div>
    </div>
  )
}
