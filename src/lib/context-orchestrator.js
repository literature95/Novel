/** 上下文编排器 - 步骤①：加载上下文 */

// 上下文切片类型
export const CONTEXT_SLICE = {
  CHARACTERS: 'characters',
  LOCATIONS: 'locations',
  MAGIC_SYSTEM: 'magicSystem',
  TIMELINE: 'timeline',
  CONSTRAINTS: 'constraints',
  PLOT_LINES: 'plotLines',
  FORESHADOWS: 'foreshadows',
  VOLUMES: 'volumes',
  CHAPTERS: 'chapters',
  SCENES: 'scenes',
}

// 节点依赖的上下文切片映射
export const NODE_CONTEXT_MAP = {
  'N-1.1': [CONTEXT_SLICE.CHARACTERS],
  'N-1.2': [CONTEXT_SLICE.LOCATIONS],
  'N-1.3': [CONTEXT_SLICE.MAGIC_SYSTEM],
  'N-1.4': [CONTEXT_SLICE.TIMELINE],
  'N-1.5': [CONTEXT_SLICE.CHARACTERS, CONTEXT_SLICE.LOCATIONS, CONTEXT_SLICE.MAGIC_SYSTEM, CONTEXT_SLICE.TIMELINE],
  'N-2.1': [CONTEXT_SLICE.CHARACTERS, CONTEXT_SLICE.CONSTRAINTS],
  'N-2.2': [CONTEXT_SLICE.CHARACTERS, CONTEXT_SLICE.FORESHADOWS],
  'N-2.3': [CONTEXT_SLICE.CHARACTERS, CONTEXT_SLICE.PLOT_LINES],
  'N-4.1': [CONTEXT_SLICE.PLOT_LINES, CONTEXT_SLICE.FORESHADOWS],
  'N-4.2': [CONTEXT_SLICE.VOLUMES, CONTEXT_SLICE.FORESHADOWS, CONTEXT_SLICE.CHARACTERS],
  'N-5.1': [CONTEXT_SLICE.CHAPTERS, CONTEXT_SLICE.CHARACTERS, CONTEXT_SLICE.LOCATIONS, CONTEXT_SLICE.FORESHADOWS],
  'N-6.1': [CONTEXT_SLICE.FORESHADOWS, CONTEXT_SLICE.CHAPTERS],
  'N-6.2': [CONTEXT_SLICE.CONSTRAINTS, CONTEXT_SLICE.SCENES],
  'N-7.1': [CONTEXT_SLICE.FORESHADOWS],
  'N-7.2': [CONTEXT_SLICE.CHARACTERS, CONTEXT_SLICE.PLOT_LINES],
  'N-7.3': [CONTEXT_SLICE.CONSTRAINTS],
  'N-7.4': [CONTEXT_SLICE.FORESHADOWS, CONTEXT_SLICE.CHARACTERS, CONTEXT_SLICE.PLOT_LINES, CONTEXT_SLICE.CONSTRAINTS],
}

// 上下文大小限制（字节）
const MAX_CONTEXT_SIZE = 8 * 1024 // 8KB

/**
 * 从项目中提取指定节点所需的上下文
 * @param {Object} project - 完整项目数据
 * @param {string} nodeKey - 节点标识（如 N-1.1）
 * @returns {Object} 上下文切片对象
 */
export function loadContextForNode(project, nodeKey) {
  const requiredSlices = NODE_CONTEXT_MAP[nodeKey] || []
  const context = {}

  for (const slice of requiredSlices) {
    context[slice] = project[slice] || []
  }

  // 添加基础元数据
  context.meta = project.meta || {}

  return context
}

/**
 * 计算上下文大小
 * @param {Object} context - 上下文对象
 * @returns {number} 大小（字节）
 */
export function getContextSize(context) {
  return new TextEncoder().encode(JSON.stringify(context)).length
}

/**
 * 检查上下文是否在大小限制内
 * @param {Object} context - 上下文对象
 * @returns {boolean}
 */
export function isContextSizeValid(context) {
  return getContextSize(context) <= MAX_CONTEXT_SIZE
}

/**
 * 智能裁剪上下文以符合大小限制
 * @param {Object} context - 原始上下文
 * @returns {Object} 裁剪后的上下文
 */
export function trimContextToLimit(context) {
  let trimmed = { ...context }
  let size = getContextSize(trimmed)

  if (size <= MAX_CONTEXT_SIZE) {
    return trimmed
  }

  // 策略：逐步裁剪非关键数据
  const slices = Object.keys(trimmed).filter(k => k !== 'meta')
  
  for (const slice of slices) {
    if (Array.isArray(trimmed[slice])) {
      // 保留前10个元素
      if (trimmed[slice].length > 10) {
        trimmed[slice] = trimmed[slice].slice(0, 10)
      }
      
      // 简化每个元素
      trimmed[slice] = trimmed[slice].map(item => {
        const simplified = { ...item }
        // 移除长文本字段
        const longFields = ['desc', 'content', 'note', 'features']
        for (const field of longFields) {
          if (simplified[field] && typeof simplified[field] === 'string' && simplified[field].length > 100) {
            simplified[field] = simplified[field].substring(0, 100) + '...'
          }
        }
        return simplified
      })
    }

    size = getContextSize(trimmed)
    if (size <= MAX_CONTEXT_SIZE) break
  }

  return trimmed
}

/**
 * 获取节点执行所需的完整上下文
 * @param {Object} project - 完整项目数据
 * @param {string} nodeKey - 节点标识
 * @returns {{context: Object, size: number, trimmed: boolean}}
 */
export function getNodeContext(project, nodeKey) {
  const rawContext = loadContextForNode(project, nodeKey)
  const originalSize = getContextSize(rawContext)
  const needsTrim = originalSize > MAX_CONTEXT_SIZE
  const context = needsTrim ? trimContextToLimit(rawContext) : rawContext

  return {
    context,
    size: getContextSize(context),
    trimmed: needsTrim,
    originalSize,
  }
}

/**
 * 构建 AI 提示词的上下文前缀
 * @param {Object} context - 上下文对象
 * @returns {string} 格式化的上下文文本
 */
export function formatContextForPrompt(context) {
  const parts = []
  
  if (context.characters?.length) {
    parts.push(`角色列表（${context.characters.length}人）：\n${context.characters.map(c => 
      `- ${c.name}（${c.status || '存活'}）：${c.desc?.substring(0, 50) || '暂无描述'}`
    ).join('\n')}`)
  }

  if (context.locations?.length) {
    parts.push(`地点列表（${context.locations.length}个）：\n${context.locations.map(l => 
      `- ${l.name}（${l.type}）`
    ).join('\n')}`)
  }

  if (context.magicSystem?.length) {
    parts.push(`力量体系（${context.magicSystem.length}项）：\n${context.magicSystem.map(m => 
      `- ${m.name}（${m.type}）`
    ).join('\n')}`)
  }

  if (context.foreshadows?.length) {
    const activeFs = context.foreshadows.filter(f => f.status !== 'resolved')
    parts.push(`活跃伏笔（${activeFs.length}个）：\n${activeFs.map(f => 
      `- ${f.id}: ${f.title}（${f.status}）`
    ).join('\n')}`)
  }

  if (context.constraints?.length) {
    const rules = context.constraints.filter(c => c.type === 'absolute')
    parts.push(`绝对规则（${rules.length}条）：\n${rules.map(r => 
      `- ${r.name}`
    ).join('\n')}`)
  }

  return parts.join('\n\n')
}