/** 节点状态（对齐 状态节点.md，completed 避免与章节 locked 混淆） */
export const NODE_STATUS = {
  blocked: { dot: 'blocked', badge: 'blocked', label: '已锁定' },
  unlocked: { dot: 'unlocked', badge: 'unlocked', label: '待开始' },
  progress: { dot: 'progress', badge: 'progress', label: '进行中' },
  completed: { dot: 'completed', badge: 'done', label: '已完成' },
  skip: { dot: 'skip', badge: 'locked', label: '已跳过' },
  stale_review: { dot: 'stale', badge: 'warning', label: '待审查' },
  stale_rewrite: { dot: 'stale', badge: 'error', label: '待重写' },
}

/** 默认阶段节点（含 nodeKey / dependsOn） */
export function buildDefaultPhases() {
  return [
    { id: 1, name: '世界观与规则构建', status: 'done', nodes: [
      { id: '1.1', nodeKey: 'N-1.1', name: '角色库', desc: '主要角色档案、人物弧线、关系网', status: 'completed', dependsOn: ['N-0'], count: 0, icon: 'Users' },
      { id: '1.2', nodeKey: 'N-1.2', name: '地点库', desc: '场景地点、地理关系、出现规则', status: 'completed', dependsOn: ['N-0'], count: 7, icon: 'MapPin' },
      { id: '1.3', nodeKey: 'N-1.3', name: '力量体系', desc: '超自然能力定义、代价与约束', status: 'completed', dependsOn: ['N-0'], count: 5, icon: 'Zap' },
      { id: '1.4', nodeKey: 'N-1.4', name: '时间线', desc: '历史纪年与关键事件编年', status: 'completed', dependsOn: ['N-0'], count: 3, icon: 'Calendar' },
      { id: '1.5', nodeKey: 'N-1.5', name: '约束规则库', desc: '硬规则、软规则、写作指南', status: 'completed', dependsOn: ['N-1.1', 'N-1.2', 'N-1.3', 'N-1.4'], count: 0, icon: 'Shield' },
    ]},
    { id: 2, name: '全局叙事规划', status: 'done', nodes: [
      { id: '2.1', nodeKey: 'N-2.1', name: '三幕结构', desc: '宏观节奏、情感曲线、中点反转', status: 'completed', dependsOn: ['N-1.5'], count: 3, icon: 'Clapperboard' },
      { id: '2.2', nodeKey: 'N-2.2', name: '五线规划', desc: '主线/感情/反派/世界观/主题 五线里程碑', status: 'completed', dependsOn: ['N-2.1'], count: 5, icon: 'GitBranch' },
      { id: '2.3', nodeKey: 'N-2.3', name: '伏笔网设计', desc: '伏笔节点、因果/强化/矛盾/铺垫边', status: 'completed', dependsOn: ['N-2.2'], count: 15, icon: 'Network' },
    ]},
    { id: 3, name: '协同任务分配', status: 'skip', nodes: [
      { id: '3.1', nodeKey: 'N-3.1', name: '协同面板', desc: '作者分配、章节归属、交接日志', status: 'skip', dependsOn: ['N-2.2'], count: 0, icon: 'UsersRound' },
    ]},
    { id: 4, name: '分册章节蓝图', status: 'progress', nodes: [
      { id: '4.1', nodeKey: 'N-4.1', name: '分册骨架', desc: '三册划分、钩子/中点/高潮场景标记', status: 'completed', dependsOn: ['N-2.1', 'N-2.2'], count: 3, icon: 'BookOpen' },
      { id: '4.2', nodeKey: 'N-4.2', name: '逐章大纲', desc: '60章完整大纲含元数据', status: 'progress', dependsOn: ['N-4.1', 'N-2.3'], count: 0, icon: 'ListChecks' },
    ]},
    { id: 5, name: '场景迭代写作', status: 'progress', nodes: [
      { id: '5.1', nodeKey: 'N-5.1', name: '场景写作循环', desc: '生成 → 校验 → 人工确认 → 锁定写入', status: 'progress', dependsOn: ['N-4.2'], count: 0, icon: 'PenTool' },
    ]},
    { id: 6, name: '实时校验与协同调整', status: 'progress', nodes: [
      { id: '6.1', nodeKey: 'N-6.1', name: '伏笔看板', desc: '超期告警、回收推荐、状态统计', status: 'progress', dependsOn: ['N-5.1'], count: 3, icon: 'Pin' },
      { id: '6.2', nodeKey: 'N-6.2', name: '约束扫描', desc: '绝对规则检查、软规则建议', status: 'completed', dependsOn: ['N-1.5', 'N-5.1'], count: 0, icon: 'Search' },
      { id: '6.3', nodeKey: 'N-6.3', name: '协同同步', desc: '多作者交接日志、冲突检测', status: 'skip', dependsOn: ['N-5.1'], count: 0, icon: 'RefreshCw' },
    ]},
    { id: 7, name: '修订闭环与交付', status: 'blocked', nodes: [
      { id: '7.1', nodeKey: 'N-7.1', name: '伏笔终审', desc: '全伏笔回收率审查', status: 'blocked', dependsOn: ['N-6.1'], count: 0, icon: 'Target' },
      { id: '7.2', nodeKey: 'N-7.2', name: '弧线完成度', desc: '角色弧线+叙事线完成度审计', status: 'blocked', dependsOn: ['N-6.2'], count: 0, icon: 'TrendingUp' },
      { id: '7.3', nodeKey: 'N-7.3', name: '规则清零', desc: 'inconsistency_log 残留清零', status: 'blocked', dependsOn: ['N-6.2'], count: 0, icon: 'CheckCircle' },
      { id: '7.4', nodeKey: 'N-7.4', name: '终审报告', desc: '健康度评分、修订优先级、交付决策', status: 'blocked', dependsOn: ['N-7.1', 'N-7.2', 'N-7.3'], count: 0, icon: 'FileText' },
    ]},
  ]
}

/** 旧 status 迁移 */
export function normalizeNodeStatus(status) {
  if (status === 'done') return 'completed'
  if (status === 'locked') return 'blocked'
  return status
}

export function normalizePhaseNode(node) {
  const defaults = { dependsOn: ['N-0'], nodeKey: `N-${node.id}` }
  return {
    ...defaults,
    ...node,
    status: normalizeNodeStatus(node.status),
    nodeKey: node.nodeKey ?? defaults.nodeKey,
    dependsOn: node.dependsOn ?? defaults.dependsOn,
  }
}

export function isNodeCompleted(nodeKey, project) {
  if (nodeKey === 'N-0') return true
  const node = findNode(nodeKey, project)
  if (!node) return false
  const s = normalizeNodeStatus(node.status)
  return s === 'completed' || s === 'skip'
}

export function findNode(nodeKey, project) {
  for (const phase of project.phases || []) {
    const n = phase.nodes?.find(x => x.nodeKey === nodeKey)
    if (n) return n
  }
  return null
}

/** 计算节点有效状态（含依赖与回溯标记） */
export function getEffectiveNodeStatus(node, project) {
  const stale = project.staleMarkers?.[node.nodeKey]
  if (stale === 'rewrite') return 'stale_rewrite'
  if (stale === 'review') return 'stale_review'

  const raw = normalizeNodeStatus(node.status)
  if (raw === 'skip') return 'skip'
  if (raw === 'progress') return 'progress'
  if (raw === 'completed') return 'completed'

  const deps = node.dependsOn || ['N-0']
  const ready = deps.every(dep => isNodeCompleted(dep, project))
  if (!ready) return 'blocked'
  return 'unlocked'
}

export function syncPhaseCounts(project) {
  const charCount = project.characters?.length ?? 0
  const constraintCount = project.constraints?.length ?? 0
  const chapterCount = project.chapters?.length ?? 0
  let sceneCount = 0
  Object.values(project.scenes || {}).forEach(list => { sceneCount += list.length })

  return project.phases.map(phase => ({
    ...phase,
    nodes: phase.nodes.map(node => {
      let count = node.count
      if (node.nodeKey === 'N-1.1') count = charCount
      if (node.nodeKey === 'N-1.5') count = constraintCount
      if (node.nodeKey === 'N-4.2') count = chapterCount
      if (node.nodeKey === 'N-5.1') count = sceneCount
      if (node.nodeKey === 'N-6.2') count = constraintCount
      if (node.nodeKey === 'N-3.1') count = project.collaboration?.writers?.length ?? 0
      if (node.nodeKey === 'N-6.3') count = project.collaboration?.syncLog?.length ?? 0
      return { ...node, count }
    }),
  }))
}

/** 修改角色后标记回溯影响链（状态节点.md） */
export function computeStaleFromCharacterChange(characterName, project) {
  const markers = { ...(project.staleMarkers || {}) }
  markers['N-1.5'] = 'review'
  markers['N-2.2'] = 'review'
  markers['N-2.3'] = 'review'

  project.foreshadows?.forEach(f => {
    if (f.title?.includes(characterName) || f.desc?.includes(characterName)) {
      markers['N-2.3'] = 'review'
    }
  })

  project.chapters?.forEach(ch => {
    if (ch.characters?.includes(characterName)) {
      markers[`N-4.2:ch${ch.id}`] = 'review'
    }
  })

  Object.entries(project.scenes || {}).forEach(([, list]) => {
    list.forEach(s => {
      if (s.pov === characterName) markers[`N-5.1:${s.id}`] = 'rewrite'
    })
  })

  return markers
}

export function enrichProject(project) {
  if (!project || typeof project !== 'object') {
    return null
  }
  try {
    const phases = (project.phases ?? buildDefaultPhases()).map(phase => ({
      ...phase,
      status: normalizeNodeStatus(phase.status === 'locked' ? 'blocked' : phase.status),
      nodes: (phase.nodes || []).map(normalizePhaseNode),
    }))
    return syncPhaseCounts({
      ...project,
      phases,
      staleMarkers: project.staleMarkers ?? {},
    })
  } catch (e) {
    console.error('[Novel] enrichProject 失败', e)
    return { ...project, phases: buildDefaultPhases(), staleMarkers: project.staleMarkers ?? {} }
  }
}
