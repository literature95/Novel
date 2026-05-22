/** Schema 校验器 - 步骤③：自动校验 */

// 角色 Schema
const CHARACTER_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1 },
    status: { type: 'string', enum: ['alive', 'dead'] },
    role: { type: 'string' },
    arc: { type: 'string' },
    arcProgress: { type: 'number', minimum: 0, maximum: 1 },
    desc: { type: 'string' },
  },
  required: ['id', 'name', 'status'],
}

// 地点 Schema
const LOCATION_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1 },
    type: { type: 'string' },
    era: { type: 'string' },
    features: { type: 'string' },
    connectedTo: { type: 'array', items: { type: 'string' } },
    mood: { type: 'string' },
  },
  required: ['id', 'name'],
}

// 力量体系 Schema
const MAGIC_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1 },
    type: { type: 'string' },
    source: { type: 'string' },
    rules: { type: 'string' },
    cost: { type: 'string' },
    usage: { type: 'string' },
    note: { type: 'string' },
  },
  required: ['id', 'name', 'rules', 'cost'],
}

// 时间线事件 Schema
const TIMELINE_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string', minLength: 1 },
    year: { type: 'string', minLength: 1 },
    event: { type: 'string', minLength: 1 },
    era: { type: 'string' },
    characters: { type: 'array', items: { type: 'string' } },
    locations: { type: 'array', items: { type: 'string' } },
    significance: { type: 'string', enum: ['高', '中', '低'] },
  },
  required: ['id', 'year', 'event'],
}

// 约束规则 Schema
const CONSTRAINT_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string', minLength: 1 },
    type: { type: 'string', enum: ['absolute', 'soft'] },
    name: { type: 'string', minLength: 1 },
    desc: { type: 'string' },
    severity: { type: 'number', minimum: 0, maximum: 1 },
  },
  required: ['id', 'type', 'name'],
}

// 伏笔 Schema
const FORESHADOW_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string', minLength: 1 },
    title: { type: 'string', minLength: 1 },
    importance: { type: 'number', minimum: 0, maximum: 1 },
    status: { type: 'string', enum: ['drafted', 'planted', 'triggered', 'resolved'] },
    planted: { type: 'string' },
    deadline: { type: 'string' },
    desc: { type: 'string' },
  },
  required: ['id', 'title', 'status'],
}

// 场景 Schema
const SCENE_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string', minLength: 1 },
    title: { type: 'string', minLength: 1 },
    pov: { type: 'string' },
    setting: { type: 'string' },
    content: { type: 'string' },
    beats: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          text: { type: 'string' },
        },
        required: ['type', 'text'],
      },
    },
    conflict: {
      type: 'object',
      properties: {
        type: { type: 'array', items: { type: 'string' } },
        intensity: { type: 'number', minimum: 0, maximum: 1 },
        turningPoint: { type: 'boolean' },
        resolution: { type: 'string' },
      },
      required: ['type', 'intensity'],
    },
    foreshadow: {
      type: 'object',
      properties: {
        planted: { type: 'array', items: { type: 'string' } },
        triggered: { type: 'array', items: { type: 'string' } },
        resolved: { type: 'array', items: { type: 'string' } },
      },
      required: ['planted', 'triggered', 'resolved'],
    },
  },
  required: ['id', 'title'],
}

// 章节 Schema
const CHAPTER_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: ['string', 'number'] },
    number: { type: 'number', minimum: 1 },
    title: { type: 'string', minLength: 1 },
    status: { type: 'string', enum: ['locked', 'pending', 'writing', 'done'] },
    words: { type: 'number', minimum: 0 },
    targetWords: { type: 'number', minimum: 0 },
    scenes: { type: 'number', minimum: 0 },
    characters: { type: 'array', items: { type: 'string' } },
    locations: { type: 'array', items: { type: 'string' } },
    plotLines: { type: 'array', items: { type: 'string' } },
    momentum: { type: 'number', minimum: 0, maximum: 1 },
    emotionPeak: { type: 'number', minimum: 0, maximum: 1 },
    pov: { type: 'string' },
  },
  required: ['id', 'title'],
}

// Schema 映射
const SCHEMA_MAP = {
  character: CHARACTER_SCHEMA,
  location: LOCATION_SCHEMA,
  magic: MAGIC_SCHEMA,
  timeline: TIMELINE_SCHEMA,
  constraint: CONSTRAINT_SCHEMA,
  foreshadow: FORESHADOW_SCHEMA,
  scene: SCENE_SCHEMA,
  chapter: CHAPTER_SCHEMA,
}

/**
 * 验证单个对象是否符合 Schema
 * @param {Object} data - 要验证的数据
 * @param {Object} schema - Schema 定义
 * @param {string} path - 当前路径（用于错误消息）
 * @returns {{valid: boolean, errors: Array}}
 */
function validateObject(data, schema, path = '') {
  const errors = []

  // 检查类型
  if (typeof data !== 'object' || data === null) {
    errors.push({ path, message: `期望对象类型，实际得到 ${typeof data}` })
    return { valid: false, errors }
  }

  // 检查必需字段
  for (const required of schema.required || []) {
    if (!(required in data)) {
      errors.push({ path: `${path}.${required}`, message: `缺少必需字段` })
    }
  }

  // 检查属性
  for (const [key, propSchema] of Object.entries(schema.properties || {})) {
    const value = data[key]
    const propPath = path ? `${path}.${key}` : key

    // 如果字段不存在且不是必需的，跳过
    if (value === undefined && !schema.required?.includes(key)) continue

    // 验证属性值
    const result = validateValue(value, propSchema, propPath)
    if (!result.valid) {
      errors.push(...result.errors)
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * 验证单个值
 * @param {*} value - 要验证的值
 * @param {Object} schema - 属性 Schema
 * @param {string} path - 当前路径
 * @returns {{valid: boolean, errors: Array}}
 */
function validateValue(value, schema, path) {
  const errors = []

  // 处理数组类型
  if (schema.type === 'array') {
    if (!Array.isArray(value)) {
      errors.push({ path, message: `期望数组类型，实际得到 ${typeof value}` })
      return { valid: false, errors }
    }

    // 验证每个元素
    for (let i = 0; i < value.length; i++) {
      const result = validateValue(value[i], schema.items, `${path}[${i}]`)
      if (!result.valid) {
        errors.push(...result.errors)
      }
    }

    return { valid: errors.length === 0, errors }
  }

  // 处理对象类型
  if (schema.type === 'object') {
    return validateObject(value, schema, path)
  }

  // 处理基本类型
  if (schema.type === 'string') {
    if (typeof value !== 'string') {
      errors.push({ path, message: `期望字符串类型，实际得到 ${typeof value}` })
    } else if (schema.minLength && value.length < schema.minLength) {
      errors.push({ path, message: `长度不足（最小 ${schema.minLength}）` })
    } else if (schema.maxLength && value.length > schema.maxLength) {
      errors.push({ path, message: `长度超出（最大 ${schema.maxLength}）` })
    } else if (schema.enum && !schema.enum.includes(value)) {
      errors.push({ path, message: `值必须是 ${schema.enum.join('、')} 之一` })
    }
  }

  if (schema.type === 'number') {
    if (typeof value !== 'number') {
      errors.push({ path, message: `期望数字类型，实际得到 ${typeof value}` })
    } else if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push({ path, message: `值小于最小值 ${schema.minimum}` })
    } else if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push({ path, message: `值大于最大值 ${schema.maximum}` })
    }
  }

  if (schema.type === 'boolean') {
    if (typeof value !== 'boolean') {
      errors.push({ path, message: `期望布尔类型，实际得到 ${typeof value}` })
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * 验证数据是否符合指定类型的 Schema
 * @param {Object} data - 要验证的数据
 * @param {string} type - 数据类型（character/location/magic/timeline/constraint/foreshadow/scene/chapter）
 * @returns {{valid: boolean, errors: Array}}
 */
export function validateSchema(data, type) {
  const schema = SCHEMA_MAP[type]
  if (!schema) {
    return { valid: false, errors: [{ path: '', message: `未知类型: ${type}` }] }
  }

  return validateObject(data, schema, '')
}

/**
 * 批量验证数组数据
 * @param {Array} items - 要验证的数据数组
 * @param {string} type - 数据类型
 * @returns {{valid: boolean, errors: Array}}
 */
export function validateArray(items, type) {
  const allErrors = []

  if (!Array.isArray(items)) {
    return { valid: false, errors: [{ path: '', message: '期望数组' }] }
  }

  for (let i = 0; i < items.length; i++) {
    const result = validateSchema(items[i], type)
    if (!result.valid) {
      const indexedErrors = result.errors.map(e => ({
        ...e,
        path: `[${i}]${e.path ? `.${e.path}` : ''}`,
      }))
      allErrors.push(...indexedErrors)
    }
  }

  return { valid: allErrors.length === 0, errors: allErrors }
}

/**
 * 验证整个项目数据结构
 * @param {Object} project - 项目数据
 * @returns {{valid: boolean, errors: Array}}
 */
export function validateProject(project) {
  const errors = []

  // 验证基础结构
  if (!project || typeof project !== 'object') {
    return { valid: false, errors: [{ path: '', message: '项目数据无效' }] }
  }

  // 验证元数据
  if (!project.meta || typeof project.meta !== 'object') {
    errors.push({ path: 'meta', message: '元数据无效' })
  }

  // 验证角色
  if (project.characters) {
    const result = validateArray(project.characters, 'character')
    if (!result.valid) {
      errors.push(...result.errors.map(e => ({ ...e, path: `characters${e.path}` })))
    }
  }

  // 验证地点
  if (project.locations) {
    const result = validateArray(project.locations, 'location')
    if (!result.valid) {
      errors.push(...result.errors.map(e => ({ ...e, path: `locations${e.path}` })))
    }
  }

  // 验证力量体系
  if (project.magicSystem) {
    const result = validateArray(project.magicSystem, 'magic')
    if (!result.valid) {
      errors.push(...result.errors.map(e => ({ ...e, path: `magicSystem${e.path}` })))
    }
  }

  // 验证时间线
  if (project.timeline) {
    const result = validateArray(project.timeline, 'timeline')
    if (!result.valid) {
      errors.push(...result.errors.map(e => ({ ...e, path: `timeline${e.path}` })))
    }
  }

  // 验证约束规则
  if (project.constraints) {
    const result = validateArray(project.constraints, 'constraint')
    if (!result.valid) {
      errors.push(...result.errors.map(e => ({ ...e, path: `constraints${e.path}` })))
    }
  }

  // 验证伏笔
  if (project.foreshadows) {
    const result = validateArray(project.foreshadows, 'foreshadow')
    if (!result.valid) {
      errors.push(...result.errors.map(e => ({ ...e, path: `foreshadows${e.path}` })))
    }
  }

  // 验证章节
  if (project.chapters) {
    const result = validateArray(project.chapters, 'chapter')
    if (!result.valid) {
      errors.push(...result.errors.map(e => ({ ...e, path: `chapters${e.path}` })))
    }
  }

  // 验证场景
  if (project.scenes) {
    for (const [chapterId, scenes] of Object.entries(project.scenes)) {
      const result = validateArray(scenes, 'scene')
      if (!result.valid) {
        errors.push(...result.errors.map(e => ({ 
          ...e, 
          path: `scenes['${chapterId}']${e.path}` 
        })))
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * 格式化验证错误消息
 * @param {Array} errors - 错误数组
 * @returns {string}
 */
export function formatValidationErrors(errors) {
  return errors.map(e => {
    const path = e.path ? `[${e.path}] ` : ''
    return `${path}${e.message}`
  }).join('\n')
}