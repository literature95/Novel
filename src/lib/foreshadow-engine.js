/** 伏笔状态机引擎 - 步骤③：伏笔状态机校验 */

// 伏笔状态定义
export const FORESHADOW_STATUS = {
  DRAFTED: 'drafted',      // 草稿：待规划
  PLANTED: 'planted',      // 种植：已在某处埋下
  TRIGGERED: 'triggered',  // 触发：读者意识到重要性
  RESOLVED: 'resolved',    // 回收：伏笔揭示完成
}

// 状态转换规则
const TRANSITION_RULES = {
  [FORESHADOW_STATUS.DRAFTED]: [FORESHADOW_STATUS.PLANTED],
  [FORESHADOW_STATUS.PLANTED]: [FORESHADOW_STATUS.TRIGGERED, FORESHADOW_STATUS.RESOLVED],
  [FORESHADOW_STATUS.TRIGGERED]: [FORESHADOW_STATUS.RESOLVED],
  [FORESHADOW_STATUS.RESOLVED]: [], // 终态，不可转换
}

// 状态标签映射
export const STATUS_LABELS = {
  [FORESHADOW_STATUS.DRAFTED]: '草稿',
  [FORESHADOW_STATUS.PLANTED]: '种植',
  [FORESHADOW_STATUS.TRIGGERED]: '触发',
  [FORESHADOW_STATUS.RESOLVED]: '回收',
}

/**
 * 检查状态转换是否合法
 * @param {string} currentStatus - 当前状态
 * @param {string} targetStatus - 目标状态
 * @returns {{valid: boolean, message: string}}
 */
export function validateTransition(currentStatus, targetStatus) {
  const allowed = TRANSITION_RULES[currentStatus] || []
  
  if (allowed.includes(targetStatus)) {
    return { valid: true, message: '' }
  }
  
  return {
    valid: false,
    message: `无法从「${STATUS_LABELS[currentStatus]}」转换到「${STATUS_LABELS[targetStatus]}」。允许的转换: ${allowed.map(s => STATUS_LABELS[s]).join('、')}`
  }
}

/**
 * 执行状态转换
 * @param {Object} foreshadow - 伏笔对象
 * @param {string} targetStatus - 目标状态
 * @param {string} location - 转换位置（章节/场景标识）
 * @returns {{success: boolean, foreshadow: Object, error: string}}
 */
export function transitionStatus(foreshadow, targetStatus, location = '') {
  const { valid, message } = validateTransition(foreshadow.status, targetStatus)
  
  if (!valid) {
    return { success: false, foreshadow, error: message }
  }

  const updates = {
    status: targetStatus,
  }

  // 根据目标状态设置相应字段
  switch (targetStatus) {
    case FORESHADOW_STATUS.PLANTED:
      updates.planted = location || foreshadow.planted || '-'
      break
    case FORESHADOW_STATUS.TRIGGERED:
      updates.triggered = location || '-'
      break
    case FORESHADOW_STATUS.RESOLVED:
      updates.resolved = location || '-'
      break
  }

  return {
    success: true,
    foreshadow: { ...foreshadow, ...updates },
    error: '',
  }
}

/**
 * 检查伏笔是否过期
 * @param {Object} foreshadow - 伏笔对象
 * @param {number} currentChapter - 当前章节号
 * @returns {{overdue: boolean, message: string}}
 */
export function checkOverdue(foreshadow, currentChapter) {
  if (!foreshadow.deadline) {
    return { overdue: false, message: '' }
  }

  // 提取截止章节号
  const deadlineMatch = foreshadow.deadline.match(/Ch(\d+)/)
  if (!deadlineMatch) {
    return { overdue: false, message: '' }
  }

  const deadlineChapter = parseInt(deadlineMatch[1])
  
  if (foreshadow.status !== FORESHADOW_STATUS.RESOLVED && currentChapter > deadlineChapter) {
    return {
      overdue: true,
      message: `伏笔「${foreshadow.title}」(ID: ${foreshadow.id}) 已过期，截止章节: Ch${deadlineChapter}，当前章节: Ch${currentChapter}`
    }
  }

  // 检查即将到期（还差3章）
  if (foreshadow.status !== FORESHADOW_STATUS.RESOLVED && currentChapter >= deadlineChapter - 3) {
    return {
      overdue: false,
      message: `伏笔「${foreshadow.title}」(ID: ${foreshadow.id}) 即将到期，截止章节: Ch${deadlineChapter}`
    }
  }

  return { overdue: false, message: '' }
}

/**
 * 批量检查伏笔过期情况
 * @param {Array} foreshadows - 伏笔数组
 * @param {number} currentChapter - 当前章节号
 * @returns {Array} 过期警告数组
 */
export function checkAllOverdue(foreshadows, currentChapter) {
  const warnings = []

  for (const fs of foreshadows) {
    const result = checkOverdue(fs, currentChapter)
    if (result.overdue || result.message) {
      warnings.push({
        id: fs.id,
        title: fs.title,
        status: fs.status,
        deadline: fs.deadline,
        ...result,
      })
    }
  }

  return warnings
}

/**
 * 计算伏笔回收率
 * @param {Array} foreshadows - 伏笔数组
 * @returns {{resolved: number, total: number, rate: number}}
 */
export function calculateRecoveryRate(foreshadows) {
  if (!foreshadows || foreshadows.length === 0) {
    return { resolved: 0, total: 0, rate: 0 }
  }

  const resolved = foreshadows.filter(f => f.status === FORESHADOW_STATUS.RESOLVED).length
  const total = foreshadows.length
  const rate = Math.round((resolved / total) * 100)

  return { resolved, total, rate }
}

/**
 * 验证伏笔数据完整性
 * @param {Object} foreshadow - 伏笔对象
 * @returns {{valid: boolean, errors: Array}}
 */
export function validateForeshadow(foreshadow) {
  const errors = []

  if (!foreshadow.id) {
    errors.push('缺少 ID')
  }

  if (!foreshadow.title) {
    errors.push('缺少标题')
  }

  if (!foreshadow.status) {
    errors.push('缺少状态')
  } else if (!Object.values(FORESHADOW_STATUS).includes(foreshadow.status)) {
    errors.push(`无效状态: ${foreshadow.status}`)
  }

  if (foreshadow.importance !== undefined) {
    if (typeof foreshadow.importance !== 'number' || foreshadow.importance < 0 || foreshadow.importance > 1) {
      errors.push('重要度必须在 0-1 之间')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 批量验证伏笔数据
 * @param {Array} foreshadows - 伏笔数组
 * @returns {{valid: boolean, errors: Array}}
 */
export function validateForeshadows(foreshadows) {
  const allErrors = []

  if (!Array.isArray(foreshadows)) {
    return { valid: false, errors: ['伏笔数据不是数组'] }
  }

  for (let i = 0; i < foreshadows.length; i++) {
    const result = validateForeshadow(foreshadows[i])
    if (!result.valid) {
      allErrors.push({
        index: i,
        id: foreshadows[i]?.id,
        errors: result.errors,
      })
    }
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  }
}

/**
 * 生成新伏笔 ID
 * @param {Array} foreshadows - 现有伏笔数组
 * @returns {string} 新 ID
 */
export function generateForeshadowId(foreshadows) {
  if (!foreshadows || foreshadows.length === 0) {
    return 'F01'
  }

  const maxId = foreshadows.reduce((max, fs) => {
    const match = fs.id?.match(/F(\d+)/)
    if (match) {
      return Math.max(max, parseInt(match[1]))
    }
    return max
  }, 0)

  return `F${String(maxId + 1).padStart(2, '0')}`
}

/**
 * 获取伏笔状态流转历史
 * @param {Object} foreshadow - 伏笔对象
 * @returns {Array} 状态历史数组
 */
export function getStatusHistory(foreshadow) {
  const history = []

  if (foreshadow.planted) {
    history.push({
      status: FORESHADOW_STATUS.PLANTED,
      location: foreshadow.planted,
      label: '种植',
    })
  }

  if (foreshadow.triggered) {
    history.push({
      status: FORESHADOW_STATUS.TRIGGERED,
      location: foreshadow.triggered,
      label: '触发',
    })
  }

  if (foreshadow.resolved) {
    history.push({
      status: FORESHADOW_STATUS.RESOLVED,
      location: foreshadow.resolved,
      label: '回收',
    })
  }

  return history
}

/**
 * 获取状态转换路径
 * @param {string} currentStatus - 当前状态
 * @returns {Array} 可转换的目标状态
 */
export function getAvailableTransitions(currentStatus) {
  return TRANSITION_RULES[currentStatus] || []
}