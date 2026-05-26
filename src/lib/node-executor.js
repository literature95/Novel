/** 节点执行器 - 整合六步标准流程 */

import { getNodeContext, formatContextForPrompt } from './context-orchestrator'
import { getAIClient, configureAIClient } from './ai-client'
import { validateSchema, validateArray } from './schema-validator'
import { aggregateProgress, completeNode } from './progress-aggregator'
import { validateTransition, checkOverdue } from './foreshadow-engine'
import { getNodeAiConfig } from './node-ai-config'
import { applyNodeGeneration } from './apply-node-data'

// 节点执行状态
export const EXECUTION_STATUS = {
  IDLE: 'idle',           // 空闲
  LOADING_CONTEXT: 'loading_context',   // 步骤①：加载上下文
  AI_GENERATING: 'ai_generating',       // 步骤②：AI生成
  VALIDATING: 'validating',             // 步骤③：自动校验
  DISPLAYING: 'displaying',             // 步骤④：Web展示
  CONFIRMING: 'confirming',             // 步骤⑤：人工确认
  WRITING: 'writing',                   // 步骤⑥：锁定写入
  COMPLETED: 'completed',               // 已完成
  FAILED: 'failed',                     // 失败
}

// 节点类型映射到 schemaType
const SCHEMA_TYPE_MAP = {
  'N-1.1': 'character',
  'N-1.2': 'location',
  'N-1.3': 'magic',
  'N-1.4': 'timeline',
  'N-1.5': 'constraint',
  'N-2.1': 'chapter',
  'N-2.2': 'chapter',
  'N-2.3': 'foreshadow',
  'N-4.2': 'chapter',
  'N-5.1': 'scene',
}

/**
 * 节点执行器类
 */
export class NodeExecutor {
  constructor(project, nodeKey) {
    this.project = project
    this.nodeKey = nodeKey
    this.status = EXECUTION_STATUS.IDLE
    this.context = null
    this.contextMeta = null
    this.generatedData = null
    this.validationResult = null
    this.errors = []
    this.warnings = []
  }

  /**
   * 获取执行状态标签
   */
  getStatusLabel() {
    const labels = {
      [EXECUTION_STATUS.IDLE]: '空闲',
      [EXECUTION_STATUS.LOADING_CONTEXT]: '加载上下文',
      [EXECUTION_STATUS.AI_GENERATING]: 'AI生成中',
      [EXECUTION_STATUS.VALIDATING]: '自动校验',
      [EXECUTION_STATUS.DISPLAYING]: 'Web展示',
      [EXECUTION_STATUS.CONFIRMING]: '人工确认',
      [EXECUTION_STATUS.WRITING]: '锁定写入',
      [EXECUTION_STATUS.COMPLETED]: '已完成',
      [EXECUTION_STATUS.FAILED]: '失败',
    }
    return labels[this.status] || this.status
  }

  /**
   * 步骤①：加载上下文
   */
  async loadContext() {
    this.status = EXECUTION_STATUS.LOADING_CONTEXT
    this.errors = []
    this.warnings = []

    try {
      const result = getNodeContext(this.project, this.nodeKey)
      this.context = result.context
      this.contextMeta = result

      if (result.trimmed) {
        this.warnings.push(`上下文内容已裁剪以符合大小限制（原始: ${result.originalSize} bytes，当前: ${result.size} bytes）`)
      }

      return { success: true, context: this.context, meta: result, warnings: this.warnings }
    } catch (error) {
      this.errors.push(`加载上下文失败: ${error.message}`)
      this.status = EXECUTION_STATUS.FAILED
      return { success: false, errors: this.errors }
    }
  }

  /**
   * 步骤②：AI生成
   * @param {Object} options - 生成选项
   */
  async generateAI(options = {}) {
    if (!this.context) {
      await this.loadContext()
    }

    this.status = EXECUTION_STATUS.AI_GENERATING
    this.errors = []

    try {
      const nodeConfig = getNodeAiConfig(this.nodeKey)
      if (!nodeConfig) {
        this.generatedData = this.#generateMockData()
        return { success: true, data: this.generatedData, source: 'mock' }
      }

      const client = configureAIClient(this.project.settings)
      const method = nodeConfig.generator
      const count = options.count || nodeConfig.defaultCount || 5

      if (typeof client[method] !== 'function') {
        throw new Error(`未实现生成方法: ${method}`)
      }

      if (this.nodeKey === 'N-4.2') {
        const chId = options.chapterId ?? this.project.chapters?.[0]?.id ?? 1
        const ch = this.project.chapters?.find(c => c.id === chId) || { id: chId, title: `第${chId}章` }
        this.generatedData = await client.generateChapterOutline(this.context, {
          number: ch.id,
          title: ch.title,
        })
      } else if (this.nodeKey === 'N-5.1') {
        const ch = this.project.chapters?.[options.chapterIdx ?? 0]
        this.generatedData = await client.generateScene(this.context, {
          chapter: ch?.title,
          pov: options.pov || ch?.characters?.[0],
          setting: options.setting || ch?.locations?.[0],
        })
      } else if (nodeConfig.array) {
        this.generatedData = await client[method](this.context, count)
      } else {
        this.generatedData = await client[method](this.context)
      }

      return { success: true, data: this.generatedData, source: 'ai' }
    } catch (error) {
      console.warn('[NodeExecutor] AI生成失败，使用模拟数据:', error.message)
      this.generatedData = this.#generateMockData()
      this.warnings.push(`API 不可用，已使用本地模拟数据：${error.message}`)
      return { success: true, data: this.generatedData, source: 'mock', warnings: this.warnings }
    }
  }

  /**
   * 生成模拟数据（用于演示）
   */
  #generateMockData() {
    const mockData = {
      'N-1.1': [
        { id: 'C06', name: '叶寒', status: 'alive', role: '主角', arc: '成长', arcProgress: 0.3, desc: '年轻的修行者，怀揣着成为强者的梦想' },
        { id: 'C07', name: '苏婉', status: 'alive', role: '女主角', arc: '觉醒', arcProgress: 0.2, desc: '神秘的少女，拥有特殊的天赋能力' },
      ],
      'N-1.2': [
        { id: 'L04', name: '青云宗', type: '门派', era: '当代', features: '正道第一大宗，坐落于青云山脉', connectedTo: ['L01'], mood: '庄严' },
        { id: 'L05', name: '黑风谷', type: '据点', era: '当代', features: '邪修聚集地，阴森恐怖', connectedTo: [], mood: '阴森' },
      ],
      'N-1.3': [
        { id: 'M04', name: '星辰诀', type: '功法', source: '星辰之力', rules: '需在夜晚修炼，吸收星辰精华', cost: '消耗精神力', usage: '提升修为', note: '顶级功法' },
      ],
      'N-1.4': [
        { id: 'T11', year: '前20年', event: '叶寒出生于青阳城', era: '近代', characters: ['叶寒'], locations: ['青阳城'], significance: '高' },
        { id: 'T12', year: '前10年', event: '青云宗开启收徒大典', era: '近代', characters: [], locations: ['青云宗'], significance: '中' },
      ],
      'N-1.5': [
        { id: 'R06', type: 'absolute', name: '不得滥杀无辜', desc: '主角必须坚守正道，不可随意杀人', severity: 1.0 },
        { id: 'R07', type: 'soft', name: '保持神秘', desc: '女主角的身世需保持神秘，逐步揭露', severity: 0.5 },
      ],
      'N-5.1': {
        id: 'ch1_s3',
        title: '月下修炼',
        pov: '叶寒',
        setting: '青云宗后山',
        content: '月光如水，洒落在叶寒身上。他盘膝而坐，运转星辰诀，感受着天地间的星辰之力缓缓涌入体内...',
        beats: [
          { type: 'start', text: '叶寒来到后山修炼' },
          { type: 'action', text: '运转星辰诀' },
          { type: 'climax', text: '突破瓶颈' },
          { type: 'end', text: '感悟新境界' },
        ],
        conflict: { type: ['internal'], intensity: 0.4, turningPoint: false, resolution: '' },
        foreshadow: { planted: [], triggered: [], resolved: [] },
      },
    }

    return mockData[this.nodeKey] || []
  }

  /**
   * 步骤③：自动校验
   */
  async validate() {
    if (!this.generatedData) {
      await this.generateAI()
    }

    this.status = EXECUTION_STATUS.VALIDATING
    this.validationResult = null
    this.errors = []

    try {
      const schemaType = SCHEMA_TYPE_MAP[this.nodeKey]
      
      if (schemaType && Array.isArray(this.generatedData)) {
        const result = validateArray(this.generatedData, schemaType)
        this.validationResult = result

        if (!result.valid) {
          this.errors.push(...result.errors.map(e => `${e.path}: ${e.message}`))
        }
      } else if (schemaType && typeof this.generatedData === 'object') {
        const result = validateSchema(this.generatedData, schemaType)
        this.validationResult = result

        if (!result.valid) {
          this.errors.push(...result.errors.map(e => `${e.path}: ${e.message}`))
        }
      }

      this.#validateBusinessRules()

      return {
        success: this.errors.length === 0,
        validationResult: this.validationResult,
        errors: this.errors,
        warnings: this.warnings,
      }
    } catch (error) {
      this.errors.push(`校验失败: ${error.message}`)
      return { success: false, errors: this.errors }
    }
  }

  /**
   * 业务规则校验
   */
  #validateBusinessRules() {
    const { nodeKey, generatedData, project } = this

    // 伏笔状态机校验
    if (nodeKey === 'N-7.1' && Array.isArray(generatedData)) {
      generatedData.forEach((fs, index) => {
        const result = validateTransition(fs.status, fs.status) // 验证当前状态是否有效
        if (!result.valid) {
          this.errors.push(`伏笔[${index}]状态无效: ${result.message}`)
        }

        // 检查过期
        const currentChapter = project.chapters?.length || 0
        const overdueResult = checkOverdue(fs, currentChapter)
        if (overdueResult.overdue) {
          this.errors.push(overdueResult.message)
        } else if (overdueResult.message) {
          this.warnings.push(overdueResult.message)
        }
      })
    }

    // 角色名字唯一性检查
    if (nodeKey === 'N-1.1' && Array.isArray(generatedData)) {
      const names = new Set()
      generatedData.forEach((char, index) => {
        if (names.has(char.name)) {
          this.errors.push(`角色[${index}]名字重复: ${char.name}`)
        }
        names.add(char.name)
      })
    }

    // 地点名字唯一性检查
    if (nodeKey === 'N-1.2' && Array.isArray(generatedData)) {
      const names = new Set()
      generatedData.forEach((loc, index) => {
        if (names.has(loc.name)) {
          this.errors.push(`地点[${index}]名字重复: ${loc.name}`)
        }
        names.add(loc.name)
      })
    }
  }

  /**
   * 步骤④：Web展示（返回展示数据）
   */
  getDisplayData() {
    this.status = EXECUTION_STATUS.DISPLAYING

    return {
      nodeKey: this.nodeKey,
      context: this.context,
      generatedData: this.generatedData,
      validationResult: this.validationResult,
      errors: this.errors,
      warnings: this.warnings,
      status: this.status,
    }
  }

  /**
   * 步骤⑤：人工确认
   * @param {boolean} confirmed - 是否确认
   * @param {Object} edits - 用户编辑内容
   */
  confirm(confirmed, edits = {}) {
    this.status = EXECUTION_STATUS.CONFIRMING

    if (confirmed) {
      // 应用用户编辑
      if (edits.data) {
        this.generatedData = edits.data
      }
      return { success: true, confirmed: true }
    } else {
      return { success: true, confirmed: false }
    }
  }

  /**
   * 步骤⑥：锁定写入
   * @returns {{success: boolean, project: Object, progress: Object}}
   */
  async write(options = {}) {
    this.status = EXECUTION_STATUS.WRITING

    try {
      const nodeConfig = getNodeAiConfig(this.nodeKey)
      const mode = options.mode || (nodeConfig?.writeMode === 'replace' ? 'replace' : 'merge')
      
      const updatedProject = applyNodeGeneration(this.project, this.nodeKey, this.generatedData, {
        mode: mode === 'patchChapter' ? 'merge' : mode,
        chapterId: options.chapterId,
        sceneChapterId: options.sceneChapterId ?? this.project.chapters?.[options.chapterIdx ?? 0]?.id,
      })

      this.status = EXECUTION_STATUS.COMPLETED

      return {
        success: true,
        project: updatedProject,
        progress: updatedProject.progress,
      }
    } catch (error) {
      this.errors.push(`写入失败: ${error.message}`)
      this.status = EXECUTION_STATUS.FAILED
      return { success: false, errors: this.errors }
    }
  }

  commit(options = {}) {
    const nodeConfig = getNodeAiConfig(this.nodeKey)
    const mode = options.mode || (nodeConfig?.writeMode === 'replace' ? 'replace' : 'merge')
    const updated = applyNodeGeneration(this.project, this.nodeKey, this.generatedData, {
      mode: mode === 'patchChapter' ? 'merge' : mode,
      chapterId: options.chapterId,
      sceneChapterId: options.sceneChapterId ?? this.project.chapters?.[options.chapterIdx ?? 0]?.id,
    })
    this.status = EXECUTION_STATUS.COMPLETED
    return { success: true, project: updated }
  }

  /**
   * 执行完整的六步流程
   * @param {Object} options - 选项
   * @returns {{success: boolean, project: Object, logs: Array}}
   */
  async execute(options = {}) {
    const logs = []

    // 步骤①：加载上下文
    logs.push('步骤①：加载上下文')
    const contextResult = await this.loadContext()
    if (!contextResult.success) {
      logs.push(`❌ 上下文加载失败: ${contextResult.errors.join(', ')}`)
      return { success: false, logs }
    }
    logs.push(`✓ 上下文加载成功（大小: ${JSON.stringify(this.context).length} bytes）`)

    // 步骤②：AI生成
    logs.push('步骤②：AI生成')
    const generateResult = await this.generateAI(options)
    if (!generateResult.success) {
      logs.push(`❌ AI生成失败: ${generateResult.errors?.join(', ')}`)
      return { success: false, logs }
    }
    logs.push(`✓ AI生成成功（数据量: ${Array.isArray(this.generatedData) ? this.generatedData.length : 1}）`)
    if (generateResult.warnings) {
      logs.push(`⚠️ ${generateResult.warnings.join(', ')}`)
    }

    // 步骤③：自动校验
    logs.push('步骤③：自动校验')
    const validateResult = await this.validate()
    if (!validateResult.success) {
      logs.push(`❌ 校验失败: ${validateResult.errors.join(', ')}`)
      return { success: false, logs, validationResult: validateResult }
    }
    logs.push(`✓ 校验通过`)
    if (validateResult.warnings.length > 0) {
      logs.push(`⚠️ ${validateResult.warnings.join(', ')}`)
    }

    // 步骤④：Web展示（自动通过，因为是程序化执行）
    logs.push('步骤④：Web展示')
    const displayData = this.getDisplayData()
    logs.push(`✓ 展示数据已准备`)

    // 步骤⑤：人工确认（默认确认）
    logs.push('步骤⑤：人工确认')
    const confirmResult = this.confirm(options.confirm !== false, options.edits)
    if (!confirmResult.confirmed) {
      logs.push(`❌ 用户取消确认`)
      return { success: false, logs }
    }
    logs.push(`✓ 用户已确认`)

    // 步骤⑥：锁定写入
    logs.push('步骤⑥：锁定写入')
    const writeResult = await this.write()
    if (!writeResult.success) {
      logs.push(`❌ 写入失败: ${writeResult.errors?.join(', ')}`)
      return { success: false, logs }
    }
    logs.push(`✓ 写入成功`)

    // 更新项目引用
    this.project = writeResult.project

    logs.push('✅ 节点执行完成')
    return { success: true, project: writeResult.project, logs, progress: writeResult.progress }
  }

  /**
   * 重置执行器状态
   */
  reset() {
    this.status = EXECUTION_STATUS.IDLE
    this.context = null
    this.generatedData = null
    this.validationResult = null
    this.errors = []
    this.warnings = []
  }
}

/**
 * 创建节点执行器
 * @param {Object} project - 项目数据
 * @param {string} nodeKey - 节点标识
 * @returns {NodeExecutor}
 */
export function createNodeExecutor(project, nodeKey) {
  return new NodeExecutor(project, nodeKey)
}

export function createNodeRunner(project, nodeKey) {
  return new NodeExecutor(project, nodeKey)
}