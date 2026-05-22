/** 进度聚合器 - 步骤⑥：重新计算全局进度 */

/**
 * 计算角色弧线进度
 * @param {Array} characters - 角色数组
 * @returns {Object}
 */
export function calculateCharacterArcProgress(characters) {
  if (!characters || characters.length === 0) {
    return { completed: 0, total: 0, percentage: 0 }
  }

  const completed = characters.filter(c => c.arcProgress >= 1).length
  const total = characters.length
  const percentage = Math.round((completed / total) * 100)

  return { completed, total, percentage }
}

/**
 * 计算叙事线进度
 * @param {Array} plotLines - 叙事线数组
 * @returns {Object}
 */
export function calculatePlotLineProgress(plotLines) {
  if (!plotLines || plotLines.length === 0) {
    return { completed: 0, total: 0, percentage: 0 }
  }

  const completed = plotLines.filter(p => p.progress >= 1).length
  const total = plotLines.length
  const percentage = Math.round((completed / total) * 100)

  return { completed, total, percentage }
}

/**
 * 计算章节完成进度
 * @param {Array} chapters - 章节数组
 * @returns {Object}
 */
export function calculateChapterProgress(chapters) {
  if (!chapters || chapters.length === 0) {
    return { 
      completed: 0, 
      writing: 0, 
      pending: 0, 
      locked: 0,
      total: 0, 
      percentage: 0,
      totalWords: 0,
      totalTargetWords: 0,
      wordPercentage: 0
    }
  }

  const completed = chapters.filter(c => c.status === 'done').length
  const writing = chapters.filter(c => c.status === 'writing').length
  const pending = chapters.filter(c => c.status === 'pending').length
  const locked = chapters.filter(c => c.status === 'locked').length
  const total = chapters.length
  const percentage = Math.round((completed / total) * 100)

  const totalWords = chapters.reduce((sum, c) => sum + (c.words || 0), 0)
  const totalTargetWords = chapters.reduce((sum, c) => sum + (c.targetWords || 0), 0)
  const wordPercentage = totalTargetWords > 0 ? Math.round((totalWords / totalTargetWords) * 100) : 0

  return { 
    completed, 
    writing, 
    pending, 
    locked,
    total, 
    percentage,
    totalWords,
    totalTargetWords,
    wordPercentage
  }
}

/**
 * 计算伏笔状态统计
 * @param {Array} foreshadows - 伏笔数组
 * @returns {Object}
 */
export function calculateForeshadowStats(foreshadows) {
  if (!foreshadows || foreshadows.length === 0) {
    return {
      drafted: 0,
      planted: 0,
      triggered: 0,
      resolved: 0,
      total: 0,
      recoveryRate: 0,
      overdueCount: 0
    }
  }

  const drafted = foreshadows.filter(f => f.status === 'drafted').length
  const planted = foreshadows.filter(f => f.status === 'planted').length
  const triggered = foreshadows.filter(f => f.status === 'triggered').length
  const resolved = foreshadows.filter(f => f.status === 'resolved').length
  const total = foreshadows.length
  const recoveryRate = total > 0 ? Math.round((resolved / total) * 100) : 0

  // 计算过期伏笔（需要检查 deadline）
  const overdueCount = foreshadows.filter(f => {
    if (f.status === 'resolved') return false
    if (!f.deadline) return false
    // 简单检查：deadline 是否是章节号，且当前已超过
    const deadlineMatch = f.deadline.match(/Ch(\d+)/)
    if (deadlineMatch) {
      const deadlineChapter = parseInt(deadlineMatch[1])
      // 这里应该对比当前已完成章节数，但暂时简化
      return true
    }
    return false
  }).length

  return {
    drafted,
    planted,
    triggered,
    resolved,
    total,
    recoveryRate,
    overdueCount
  }
}

/**
 * 计算场景统计
 * @param {Object} scenes - 场景对象（key 为章节ID）
 * @param {Array} chapters - 章节数组
 * @returns {Object}
 */
export function calculateSceneStats(scenes, chapters) {
  if (!scenes) {
    return { total: 0, completed: 0, percentage: 0 }
  }

  let total = 0
  let completed = 0

  for (const [chapterId, chapterScenes] of Object.entries(scenes)) {
    if (Array.isArray(chapterScenes)) {
      total += chapterScenes.length
      completed += chapterScenes.filter(s => s.content && s.content.length > 0).length
    }
  }

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return { total, completed, percentage }
}

/**
 * 计算五线进度
 * @param {Array} plotLines - 叙事线数组
 * @returns {Object}
 */
export function calculateFiveLineProgress(plotLines) {
  const lines = plotLines || []
  
  const lineTypes = ['主线', '感情线', '反派线', '世界观线', '主题线']
  const result = {}

  lineTypes.forEach(type => {
    const line = lines.find(p => p.type === type || p.name?.includes(type))
    result[type] = line ? {
      name: line.name,
      progress: line.progress || 0,
      milestones: line.milestones || []
    } : {
      name: type,
      progress: 0,
      milestones: []
    }
  })

  return result
}

/**
 * 计算整体项目健康度评分
 * @param {Object} project - 项目数据
 * @returns {number} 0-100 的健康度分数
 */
export function calculateHealthScore(project) {
  const { chapters, foreshadows, characters, plotLines } = project

  // 权重配置
  const weights = {
    chapterProgress: 25,
    foreshadowRecovery: 25,
    characterArc: 25,
    plotLineProgress: 25,
  }

  // 章节进度
  const chapterStats = calculateChapterProgress(chapters)
  const chapterScore = chapterStats.percentage

  // 伏笔回收率
  const foreshadowStats = calculateForeshadowStats(foreshadows)
  const foreshadowScore = foreshadowStats.recoveryRate

  // 角色弧线完成度
  const characterStats = calculateCharacterArcProgress(characters)
  const characterScore = characterStats.percentage

  // 叙事线进度
  const plotLineStats = calculatePlotLineProgress(plotLines)
  const plotLineScore = plotLineStats.percentage

  // 计算综合得分
  const totalScore = 
    (chapterScore * weights.chapterProgress +
     foreshadowScore * weights.foreshadowRecovery +
     characterScore * weights.characterArc +
     plotLineScore * weights.plotLineProgress) / 100

  return Math.round(totalScore)
}

/**
 * 聚合所有进度数据
 * @param {Object} project - 项目数据
 * @returns {Object} 包含所有进度指标的对象
 */
export function aggregateProgress(project) {
  const { chapters, scenes, foreshadows, characters, plotLines, constraints } = project

  return {
    // 章节进度
    chapters: calculateChapterProgress(chapters),
    
    // 场景统计
    scenes: calculateSceneStats(scenes, chapters),
    
    // 伏笔统计
    foreshadows: calculateForeshadowStats(foreshadows),
    
    // 角色弧线进度
    characters: calculateCharacterArcProgress(characters),
    
    // 叙事线进度
    plotLines: calculatePlotLineProgress(plotLines),
    
    // 五线详细进度
    fiveLines: calculateFiveLineProgress(plotLines),
    
    // 约束规则统计
    constraints: {
      total: constraints?.length || 0,
      absolute: constraints?.filter(c => c.type === 'absolute').length || 0,
      soft: constraints?.filter(c => c.type === 'soft').length || 0,
    },
    
    // 整体健康度
    healthScore: calculateHealthScore(project),
  }
}

/**
 * 更新章节统计数据（字数、场景数等）
 * @param {Array} chapters - 章节数组
 * @param {Object} scenes - 场景对象
 * @returns {Array} 更新后的章节数组
 */
export function syncChapterStats(chapters, scenes) {
  if (!chapters || !scenes) return chapters

  return chapters.map(chapter => {
    const chapterScenes = scenes[chapter.id] || []
    const words = chapterScenes.reduce((sum, s) => sum + (s.content?.length || 0), 0)
    const scenesCount = chapterScenes.length

    return {
      ...chapter,
      words,
      scenes: scenesCount,
      status: words > 0 ? (chapter.status === 'done' ? 'done' : 'writing') : chapter.status,
    }
  })
}

/**
 * 检查节点是否可以解锁（所有依赖节点已完成）
 * @param {Object} node - 节点数据
 * @param {Object} project - 项目数据
 * @returns {boolean}
 */
export function isNodeUnlocked(node, project) {
  const dependencies = node.dependsOn || []
  
  for (const depKey of dependencies) {
    if (!isNodeCompleted(depKey, project)) {
      return false
    }
  }
  
  return true
}

/**
 * 检查节点是否已完成
 * @param {string} nodeKey - 节点标识
 * @param {Object} project - 项目数据
 * @returns {boolean}
 */
export function isNodeCompleted(nodeKey, project) {
  if (nodeKey === 'N-0') return true // 项目初始化始终完成
  
  for (const phase of project.phases || []) {
    const node = phase.nodes?.find(n => n.nodeKey === nodeKey)
    if (node) {
      const status = node.status
      return status === 'completed' || status === 'done' || status === 'skip'
    }
  }
  
  return false
}

/**
 * 解锁下游节点（当某个节点完成时）
 * @param {string} completedNodeKey - 已完成节点的标识
 * @param {Object} project - 项目数据
 * @returns {Object} 更新后的项目数据
 */
export function unlockDownstreamNodes(completedNodeKey, project) {
  const updatedPhases = project.phases.map(phase => ({
    ...phase,
    nodes: phase.nodes.map(node => {
      // 如果此节点依赖于已完成的节点，检查是否可以解锁
      if (node.dependsOn?.includes(completedNodeKey)) {
        if (isNodeUnlocked(node, project)) {
          return { ...node, status: 'unlocked' }
        }
      }
      return node
    })
  }))

  return { ...project, phases: updatedPhases }
}

/**
 * 标记节点状态为完成并解锁下游
 * @param {string} nodeKey - 节点标识
 * @param {Object} project - 项目数据
 * @returns {Object} 更新后的项目数据
 */
export function completeNode(nodeKey, project) {
  let updatedProject = { ...project }

  // 更新节点状态
  updatedProject.phases = updatedProject.phases.map(phase => ({
    ...phase,
    nodes: phase.nodes.map(node => {
      if (node.nodeKey === nodeKey) {
        return { ...node, status: 'completed' }
      }
      return node
    })
  }))

  // 解锁下游节点
  updatedProject = unlockDownstreamNodes(nodeKey, updatedProject)

  // 重新计算进度
  updatedProject.progress = aggregateProgress(updatedProject)

  return updatedProject
}