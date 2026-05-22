/** 各节点 AI 完善模型配置（阶段一～四为主） */

export const NODE_AI_CONFIG = {
  'N-1.1': {
    label: '角色库',
    generator: 'generateCharacters',
    field: 'characters',
    array: true,
    defaultCount: 4,
    writeMode: 'merge',
  },
  'N-1.2': {
    label: '地点库',
    generator: 'generateLocations',
    field: 'locations',
    array: true,
    defaultCount: 6,
    writeMode: 'merge',
  },
  'N-1.3': {
    label: '力量体系',
    generator: 'generateMagicSystem',
    field: 'magicSystem',
    array: true,
    defaultCount: 3,
    writeMode: 'merge',
  },
  'N-1.4': {
    label: '时间线',
    generator: 'generateTimeline',
    field: 'timeline',
    array: true,
    defaultCount: 8,
    writeMode: 'merge',
  },
  'N-1.5': {
    label: '约束规则',
    generator: 'generateConstraints',
    field: 'constraints',
    array: true,
    defaultCount: 5,
    writeMode: 'merge',
  },
  'N-2.1': {
    label: '三幕结构',
    generator: 'generateActs',
    field: 'acts',
    array: true,
    writeMode: 'replace',
  },
  'N-2.2': {
    label: '五线规划',
    generator: 'generatePlotLines',
    field: 'plotLines',
    array: true,
    writeMode: 'replace',
  },
  'N-2.3': {
    label: '伏笔网',
    generator: 'generateForeshadows',
    field: 'foreshadows',
    array: true,
    defaultCount: 5,
    writeMode: 'merge',
  },
  'N-4.2': {
    label: '逐章大纲',
    generator: 'generateChapterOutline',
    field: 'chapter',
    single: true,
    writeMode: 'patchChapter',
    needsChapterTarget: true,
  },
}

export function canNodeAiGenerate(nodeKey) {
  return Boolean(NODE_AI_CONFIG[nodeKey])
}

export function getNodeAiConfig(nodeKey) {
  return NODE_AI_CONFIG[nodeKey] || null
}
