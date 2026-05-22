/** 约束校验引擎（阶段一 N-1.5 / 阶段六 N-6.2 最小实现） */

const CHECKS = [
  { id: 'pov_alive', label: 'POV 角色存在且存活', ruleId: 'R-001' },
  { id: 'pov_exists', label: 'POV 角色在角色库中', ruleId: null },
  { id: 'conflict_declared', label: '冲突类型已声明', ruleId: null },
  { id: 'chapter_chars_exist', label: '本章出场角色均在角色库', ruleId: null },
]

export function validateScene(project, chapterId, sceneIndex) {
  const issues = []
  const scene = project.scenes?.[chapterId]?.[sceneIndex]
  const chapter = project.chapters?.find(c => c.id === chapterId)

  if (!scene) {
    return { passed: true, issues: [], checks: CHECKS.map(c => ({ ...c, ok: true, skipped: true })) }
  }

  const checks = CHECKS.map(check => {
    switch (check.id) {
      case 'pov_exists': {
        const c = project.characters?.find(x => x.name === scene.pov)
        if (!c) {
          issues.push({ level: 'error', ruleId: check.ruleId, message: `POV「${scene.pov}」不在角色库中`, checkId: check.id })
          return { ...check, ok: false }
        }
        return { ...check, ok: true }
      }
      case 'pov_alive': {
        const c = project.characters?.find(x => x.name === scene.pov)
        if (c?.status === 'dead') {
          issues.push({ level: 'error', ruleId: 'R-001', message: `POV 角色「${scene.pov}」已标记为死亡，不能担任视角（除非闪回）`, checkId: check.id })
          return { ...check, ok: false }
        }
        if (!c) return { ...check, ok: false }
        return { ...check, ok: true }
      }
      case 'conflict_declared': {
        const ok = Array.isArray(scene.conflict?.type) && scene.conflict.type.length > 0
        if (!ok) issues.push({ level: 'warning', message: '场景未声明冲突类型', checkId: check.id })
        return { ...check, ok }
      }
      case 'chapter_chars_exist': {
        if (!chapter) return { ...check, ok: true, skipped: true }
        const missing = (chapter.characters || []).filter(
          name => !project.characters?.some(c => c.name === name)
        )
        if (missing.length) {
          issues.push({ level: 'warning', message: `本章角色未入库: ${missing.join('、')}`, checkId: check.id })
          return { ...check, ok: false }
        }
        return { ...check, ok: true }
      }
      default:
        return { ...check, ok: true }
    }
  })

  const errors = issues.filter(i => i.level === 'error')
  return {
    passed: errors.length === 0,
    issues,
    checks,
    errorCount: errors.length,
    warningCount: issues.filter(i => i.level === 'warning').length,
  }
}

export function validateCurrentScene(project, chapter, sceneIdx) {
  if (!chapter) return { passed: true, issues: [], checks: [], errorCount: 0, warningCount: 0 }
  return validateScene(project, chapter.id, sceneIdx)
}

/** N-6.2：扫描全部场景 */
export function validateAllScenes(project) {
  const scenesMap = project.scenes || {}
  const entries = []
  let totalScenes = 0
  let errorCount = 0
  let warningCount = 0

  for (const [chapterId, list] of Object.entries(scenesMap)) {
    if (!Array.isArray(list)) continue
    list.forEach((scene, sceneIndex) => {
      totalScenes += 1
      const result = validateScene(project, Number(chapterId), sceneIndex)
      errorCount += result.errorCount
      warningCount += result.warningCount
      if (!result.passed || result.warningCount > 0) {
        const chapter = project.chapters?.find(c => c.id === Number(chapterId))
        entries.push({
          chapterId: Number(chapterId),
          chapterTitle: chapter?.title,
          sceneIndex,
          sceneId: scene.id,
          pov: scene.pov,
          passed: result.passed,
          errorCount: result.errorCount,
          warningCount: result.warningCount,
          issues: result.issues,
        })
      }
    })
  }

  return {
    totalScenes,
    flaggedCount: entries.length,
    errorCount,
    warningCount,
    passed: errorCount === 0,
    entries,
  }
}

export { CHECKS }
