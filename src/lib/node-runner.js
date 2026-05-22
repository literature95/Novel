/**
 * 节点六步流程运行器（供 UI 分步调用）
 * ① 上下文 → ② AI 生成 → ③ 校验 → ④ 展示 → ⑤ 确认 → ⑥ 写入模型
 */

import { getNodeContext } from './context-orchestrator'
import { configureAIClient } from './ai-client'
import { getNodeAiConfig } from './node-ai-config'
import { validateSchema, validateArray } from './schema-validator'
import { applyNodeGeneration } from './apply-node-data'
import { EXECUTION_STATUS } from './node-executor'

const SCHEMA_TYPE_MAP = {
  characters: 'character',
  locations: 'location',
  magicSystem: 'magic',
  timeline: 'timeline',
  constraints: 'constraint',
  foreshadows: 'foreshadow',
  acts: 'chapter',
  plotLines: 'chapter',
  chapter: 'chapter',
  scene: 'scene',
}

function mockPayload(nodeKey, project, options) {
  const chId = options.chapterId ?? project.chapters?.[0]?.id ?? 1
  const ch = project.chapters?.find(c => c.id === chId)

  const mocks = {
    'N-1.1': [
      { name: '沈默', status: 'alive', role: '男主', arc: '从旁观到介入', desc: '外来调查者' },
      { name: '顾棠', status: 'alive', role: '女主', arc: '理性外壳下的情感复苏', desc: '档案管理员' },
    ],
    'N-1.2': [
      { id: 'L09', name: '旧档案室', type: 'building', features: '尘封卷宗', mood: '阴冷' },
    ],
    'N-1.3': [
      { id: 'M04', name: '记忆共鸣', type: 'ability', rules: '接触遗物触发', cost: '头痛与失眠' },
    ],
    'N-1.4': [
      { id: 'T08', year: '三年前', event: '第一次失踪案', significance: '高' },
    ],
    'N-1.5': [
      { id: 'R-010', type: 'absolute', name: '关键证据不可凭空出现', desc: '须有前置调查' },
    ],
    'N-2.1': [
      { name: '第一幕', range: '0–25%', goal: '引入谜团', curve: '平静→不安', twist: '' },
      { name: '第二幕', range: '25–75%', goal: '追查与代价', curve: '升高', twist: '盟友可疑' },
      { name: '第三幕', range: '75–100%', goal: '对决与抉择', curve: '高潮→余波', twist: '' },
    ],
    'N-2.2': (project.plotLines || []).map(p => ({
      ...p,
      milestone: p.milestone || '新的转折点',
      progress: Math.min(1, (p.progress || 0) + 0.05),
    })),
    'N-2.3': [
      { id: 'F06', title: '缺页的卷宗', importance: 0.8, status: 'drafted', planted: '-', deadline: `Ch${chId + 5}`, desc: '档案缺页暗示内鬼' },
    ],
    'N-4.2': {
      id: chId,
      number: chId,
      title: ch?.title ? `${ch.title}（修订）` : `第${chId}章`,
      characters: project.characters?.slice(0, 2).map(c => c.name) || [],
      locations: project.locations?.slice(0, 1).map(l => l.name) || [],
      plotLines: ['main_line'],
      momentum: 0.55,
      emotionPeak: 0.6,
    },
  }
  return mocks[nodeKey] ?? []
}

export function createNodeRunner(project, nodeKey) {
  const config = getNodeAiConfig(nodeKey)

  return {
    nodeKey,
    config,
    status: EXECUTION_STATUS.IDLE,
    context: null,
    contextMeta: null,
    generatedData: null,
    validation: null,
    errors: [],
    warnings: [],

    async loadContext() {
      this.errors = []
      this.warnings = []
      const result = getNodeContext(project, nodeKey)
      this.context = result.context
      this.contextMeta = result
      if (result.trimmed) {
        this.warnings.push(`上下文已裁剪（${result.originalSize} → ${result.size} bytes）`)
      }
      this.status = EXECUTION_STATUS.LOADING_CONTEXT
      return { success: true, context: this.context, meta: result }
    },

    async generate(options = {}) {
      if (!this.context) await this.loadContext()
      this.status = EXECUTION_STATUS.AI_GENERATING
      this.errors = []

      if (!config) {
        this.errors.push('该节点不支持 AI 生成，请使用面板手动编辑')
        return { success: false, errors: this.errors }
      }

      const count = options.count ?? config.defaultCount ?? 5
      const client = configureAIClient(project.settings)
      const method = config.generator

      try {
        if (typeof client[method] !== 'function') {
          throw new Error(`未实现生成方法: ${method}`)
        }

        if (nodeKey === 'N-4.2') {
          const chId = options.chapterId ?? project.chapters?.[0]?.id ?? 1
          const ch = project.chapters?.find(c => c.id === chId) || { id: chId, title: `第${chId}章` }
          this.generatedData = await client.generateChapterOutline(this.context, {
            number: ch.id,
            title: ch.title,
          })
        } else if (nodeKey === 'N-5.1') {
          const ch = project.chapters?.[options.chapterIdx ?? 0]
          this.generatedData = await client.generateScene(this.context, {
            chapter: ch?.title,
            pov: options.pov || ch?.characters?.[0],
            setting: options.setting || ch?.locations?.[0],
          })
        } else if (config.array) {
          this.generatedData = await client[method](this.context, count)
        } else {
          this.generatedData = await client[method](this.context)
        }

        this.warnings.push('已使用 AI 生成（需配置有效 API Key）')
        return { success: true, data: this.generatedData, source: 'ai' }
      } catch (e) {
        this.generatedData = mockPayload(nodeKey, project, options)
        this.warnings.push(`API 不可用，已使用本地模拟数据：${e.message}`)
        return { success: true, data: this.generatedData, source: 'mock', warnings: this.warnings }
      }
    },

    validate() {
      this.status = EXECUTION_STATUS.VALIDATING
      this.errors = []
      const schemaType = SCHEMA_TYPE_MAP[config?.field] || 'chapter'
      const data = this.generatedData

      if (Array.isArray(data)) {
        this.validation = validateArray(data, schemaType)
      } else if (data && typeof data === 'object') {
        this.validation = validateSchema(data, nodeKey === 'N-4.2' ? 'chapter' : schemaType)
      } else {
        this.validation = { valid: false, errors: [{ path: '', message: '无生成数据' }] }
      }

      if (!this.validation.valid) {
        this.errors.push(...this.validation.errors.map(e => `${e.path}: ${e.message}`))
      }

      return {
        success: this.errors.length === 0,
        validation: this.validation,
        errors: this.errors,
        warnings: this.warnings,
      }
    },

    commit(options = {}) {
      const mode = options.mode || (config?.writeMode === 'replace' ? 'replace' : 'merge')
      const updated = applyNodeGeneration(project, nodeKey, this.generatedData, {
        mode: mode === 'patchChapter' ? 'merge' : mode,
        chapterId: options.chapterId,
        sceneChapterId: options.sceneChapterId ?? project.chapters?.[options.chapterIdx ?? 0]?.id,
      })
      this.status = EXECUTION_STATUS.COMPLETED
      return { success: true, project: updated }
    },
  }
}
