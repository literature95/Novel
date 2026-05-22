/** AI 客户端 - 步骤②：AI生成 */

// 模型类型
export const AI_MODEL = {
  GPT_4o: 'gpt-4o',
  GPT_4o_MINI: 'gpt-4o-mini',
  CLAUDE_3_SONNET: 'claude-3-sonnet',
}

// API 端点
const API_BASE_URL = 'https://api.openai.com/v1'

/**
 * AI 客户端类
 */
export class AIClient {
  constructor(apiKey, model = AI_MODEL.GPT_4o) {
    this.apiKey = apiKey
    this.model = model
    this.baseUrl = API_BASE_URL
  }

  /**
   * 设置 API Key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey
  }

  /**
   * 设置模型
   */
  setModel(model) {
    this.model = model
  }

  /**
   * 创建请求头
   */
  #getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    }
  }

  /**
   * 调用 AI 生成内容
   * @param {string} prompt - 提示词
   * @param {Object} options - 选项
   * @param {number} options.temperature - 温度
   * @param {number} options.maxTokens - 最大token数
   * @param {Object} options.schema - JSON schema（用于结构化输出）
   * @returns {Promise<Object>}
   */
  async generate(prompt, options = {}) {
    const {
      temperature = 0.7,
      maxTokens = 4000,
      schema = null,
    } = options

    const messages = [{ role: 'user', content: prompt }]
    const body = {
      model: this.model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }

    // 如果提供了 schema，使用结构化输出
    if (schema) {
      body.response_format = {
        type: 'json_schema',
        json_schema: {
          name: 'output',
          schema,
          strict: true,
        }
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.#getHeaders(),
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || `API 请求失败: ${response.status}`)
      }

      const result = await response.json()
      const content = result.choices?.[0]?.message?.content

      if (!content) {
        throw new Error('AI 返回内容为空')
      }

      // 尝试解析 JSON
      try {
        return JSON.parse(content)
      } catch {
        return { content }
      }
    } catch (error) {
      console.error('[AI Client] 调用失败:', error)
      throw error
    }
  }

  /**
   * 生成角色
   * @param {Object} context - 上下文
   * @param {number} count - 生成数量
   * @returns {Promise<Array>} 角色数组
   */
  async generateCharacters(context, count = 5) {
    const schema = {
      type: 'object',
      properties: {
        characters: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              status: { type: 'string', enum: ['alive', 'dead'] },
              role: { type: 'string' },
              arc: { type: 'string' },
              arcProgress: { type: 'number', minimum: 0, maximum: 1 },
              desc: { type: 'string' },
            },
            required: ['id', 'name', 'status', 'role', 'arc', 'desc'],
          },
        },
      },
      required: ['characters'],
    }

    const prompt = `根据以下故事背景，生成 ${count} 个主要角色：

故事背景：${context.meta?.description || '暂无背景'}

要求：
1. 每个角色要有独特的身份和动机
2. 包含主角、配角和反派
3. 角色弧线清晰

输出格式为 JSON。`

    const result = await this.generate(prompt, { schema, temperature: 0.8 })
    return result.characters || []
  }

  /**
   * 生成地点
   * @param {Object} context - 上下文
   * @param {number} count - 生成数量
   * @returns {Promise<Array>} 地点数组
   */
  async generateLocations(context, count = 5) {
    const schema = {
      type: 'object',
      properties: {
        locations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              era: { type: 'string' },
              features: { type: 'string' },
              connectedTo: { type: 'array', items: { type: 'string' } },
              mood: { type: 'string' },
            },
            required: ['id', 'name', 'type', 'features'],
          },
        },
      },
      required: ['locations'],
    }

    const prompt = `根据以下故事背景，生成 ${count} 个重要地点：

故事背景：${context.meta?.description || '暂无背景'}

要求：
1. 地点类型多样（城市、森林、建筑等）
2. 有独特的氛围和特点
3. 可以互相连接形成关系网

输出格式为 JSON。`

    const result = await this.generate(prompt, { schema, temperature: 0.7 })
    return result.locations || []
  }

  /**
   * 生成力量体系
   * @param {Object} context - 上下文
   * @param {number} count - 生成数量
   * @returns {Promise<Array>} 力量体系数组
   */
  async generateMagicSystem(context, count = 3) {
    const schema = {
      type: 'object',
      properties: {
        magicSystem: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              source: { type: 'string' },
              rules: { type: 'string' },
              cost: { type: 'string' },
              usage: { type: 'string' },
              note: { type: 'string' },
            },
            required: ['id', 'name', 'type', 'rules', 'cost'],
          },
        },
      },
      required: ['magicSystem'],
    }

    const prompt = `根据以下故事背景，生成 ${count} 种超自然能力或力量体系：

故事背景：${context.meta?.description || '暂无背景'}

要求：
1. 每种能力要有明确的来源和规则
2. 要有使用代价或限制
3. 与故事背景相符

输出格式为 JSON。`

    const result = await this.generate(prompt, { schema, temperature: 0.6 })
    return result.magicSystem || []
  }

  /**
   * 生成时间线事件
   * @param {Object} context - 上下文
   * @param {number} count - 生成数量
   * @returns {Promise<Array>} 时间线事件数组
   */
  async generateTimeline(context, count = 10) {
    const schema = {
      type: 'object',
      properties: {
        timeline: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              year: { type: 'string' },
              event: { type: 'string' },
              era: { type: 'string' },
              characters: { type: 'array', items: { type: 'string' } },
              locations: { type: 'array', items: { type: 'string' } },
              significance: { type: 'string', enum: ['高', '中', '低'] },
            },
            required: ['id', 'year', 'event'],
          },
        },
      },
      required: ['timeline'],
    }

    const prompt = `根据以下故事背景，生成 ${count} 个关键历史事件，按时间顺序排列：

故事背景：${context.meta?.description || '暂无背景'}

要求：
1. 涵盖不同时代
2. 标注重要度（高/中/低）
3. 关联相关角色和地点

输出格式为 JSON。`

    const result = await this.generate(prompt, { schema, temperature: 0.7 })
    return result.timeline || []
  }

  /**
   * 生成约束规则
   * @param {Object} context - 上下文
   * @param {number} count - 生成数量
   * @returns {Promise<Array>} 规则数组
   */
  async generateConstraints(context, count = 5) {
    const schema = {
      type: 'object',
      properties: {
        constraints: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string', enum: ['absolute', 'soft'] },
              name: { type: 'string' },
              desc: { type: 'string' },
              severity: { type: 'number', minimum: 0, maximum: 1 },
            },
            required: ['id', 'type', 'name', 'desc'],
          },
        },
      },
      required: ['constraints'],
    }

    const prompt = `根据以下故事背景和设定，生成 ${count} 条写作约束规则：

故事背景：${context.meta?.description || '暂无背景'}

角色：${context.characters?.map(c => c.name).join('、') || '暂无'}

要求：
1. 区分硬规则（absolute，必须遵守）和软规则（soft，建议遵守）
2. 规则要具体可行
3. 帮助维持故事一致性

输出格式为 JSON。`

    const result = await this.generate(prompt, { schema, temperature: 0.5 })
    return result.constraints || []
  }

  /**
   * 生成场景内容
   * @param {Object} context - 上下文
   * @param {Object} sceneMeta - 场景元数据
   * @returns {Promise<Object>} 场景数据
   */
  async generateScene(context, sceneMeta) {
    const schema = {
      type: 'object',
      properties: {
        scene: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
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
          required: ['id', 'title', 'pov', 'setting', 'content', 'beats', 'conflict'],
        },
      },
      required: ['scene'],
    }

    const prompt = `根据以下上下文，生成一个完整的小说场景：

【故事背景】${context.meta?.description || '暂无'}

【本章信息】
章节：${sceneMeta.chapter || '未知'}
视角角色：${sceneMeta.pov || '未指定'}
场景地点：${sceneMeta.setting || '未指定'}

【活跃伏笔】
${context.foreshadows?.filter(f => f.status !== 'resolved').map(f => `- ${f.id}: ${f.title}`).join('\n') || '无'}

【约束规则】
${context.constraints?.filter(c => c.type === 'absolute').map(c => `- ${c.name}`).join('\n') || '无'}

要求：
1. 场景要有明确的目标和冲突
2. 包含4-6个叙事节拍（beats）
3. 合理运用伏笔
4. 符合约束规则
5. 语言生动，符合小说风格

输出格式为 JSON。`

    const result = await this.generate(prompt, { schema, temperature: 0.7, maxTokens: 8000 })
    return result.scene || {}
  }

  /**
   * 生成章节大纲
   * @param {Object} context - 上下文
   * @param {Object} chapterMeta - 章节元数据
   * @returns {Promise<Object>} 章节数据
   */
  async generateChapterOutline(context, chapterMeta) {
    const schema = {
      type: 'object',
      properties: {
        chapter: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            number: { type: 'number' },
            title: { type: 'string' },
            status: { type: 'string' },
            words: { type: 'number' },
            targetWords: { type: 'number' },
            scenes: { type: 'number' },
            characters: { type: 'array', items: { type: 'string' } },
            locations: { type: 'array', items: { type: 'string' } },
            plotLines: { type: 'array', items: { type: 'string' } },
            momentum: { type: 'number', minimum: 0, maximum: 1 },
            emotionPeak: { type: 'number', minimum: 0, maximum: 1 },
            foreshadowing: { type: 'array', items: { type: 'string' } },
            emotionalCurve: {
              type: 'array',
              items: { type: 'number', minimum: 0, maximum: 1 },
            },
          },
          required: ['id', 'number', 'title', 'characters', 'locations'],
        },
      },
      required: ['chapter'],
    }

    const prompt = `根据以下上下文，为小说第 ${chapterMeta.number || '?'} 章生成大纲：

【故事背景】${context.meta?.description || '暂无'}

【叙事线】
${context.plotLines?.map(p => `${p.id}: ${p.name}`).join('\n') || '暂无'}

【可用角色】
${context.characters?.map(c => `${c.name}（${c.status}）`).join('\n') || '暂无'}

【可用地点】
${context.locations?.map(l => l.name).join('\n') || '暂无'}

【待回收伏笔】
${context.foreshadows?.filter(f => f.status === 'planted').map(f => `${f.id}: ${f.title}`).join('\n') || '暂无'}

要求：
1. 确定章节标题和核心内容
2. 指定出场角色和场景地点
3. 规划伏笔种植/回收
4. 设置情绪曲线和节奏动量

输出格式为 JSON。`

    const result = await this.generate(prompt, { schema, temperature: 0.6 })
    return result.chapter || {}
  }

  /**
   * 生成三幕结构
   */
  async generateActs(context) {
    const schema = {
      type: 'object',
      properties: {
        acts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              range: { type: 'string' },
              goal: { type: 'string' },
              curve: { type: 'string' },
              twist: { type: 'string' },
            },
            required: ['name', 'goal'],
          },
        },
      },
      required: ['acts'],
    }

    const prompt = `根据以下故事模型，生成三幕宏观结构（第一幕/第二幕/第三幕）：

${formatStoryBrief(context)}

输出 JSON，包含 acts 数组，每项含 name、range（如 0–25%）、goal、curve、twist。`

    const result = await this.generate(prompt, { schema, temperature: 0.6 })
    return result.acts || []
  }

  /**
   * 生成五线规划（更新里程碑与进度建议）
   */
  async generatePlotLines(context) {
    const schema = {
      type: 'object',
      properties: {
        plotLines: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              progress: { type: 'number' },
              milestone: { type: 'string' },
            },
            required: ['id', 'name'],
          },
        },
      },
      required: ['plotLines'],
    }

    const prompt = `根据以下故事模型，完善五条叙事线（main_line, relationship_arc, antagonist_arc, world_arc, thematic_arc）：

${formatStoryBrief(context)}

为每条线给出 id、name、description、progress(0-1)、milestone。`

    const result = await this.generate(prompt, { schema, temperature: 0.6 })
    return result.plotLines || []
  }

  /**
   * 生成伏笔
   */
  async generateForeshadows(context, count = 5) {
    const schema = {
      type: 'object',
      properties: {
        foreshadows: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              importance: { type: 'number' },
              status: { type: 'string' },
              planted: { type: 'string' },
              deadline: { type: 'string' },
              desc: { type: 'string' },
            },
            required: ['id', 'title', 'desc'],
          },
        },
      },
      required: ['foreshadows'],
    }

    const prompt = `根据以下故事模型，设计 ${count} 个伏笔（含种植章与回收 deadline）：

${formatStoryBrief(context)}

输出 foreshadows 数组。`

    const result = await this.generate(prompt, { schema, temperature: 0.7 })
    return result.foreshadows || []
  }
}

function formatStoryBrief(context) {
  const parts = []
  if (context.meta?.title) parts.push(`书名：${context.meta.title}`)
  if (context.meta?.description) parts.push(`简介：${context.meta.description}`)
  if (context.characters?.length) {
    parts.push(`角色：${context.characters.map(c => c.name).join('、')}`)
  }
  if (context.plotLines?.length) {
    parts.push(`叙事线：${context.plotLines.map(p => p.name).join('、')}`)
  }
  return parts.join('\n') || '（暂无背景，请合理虚构悬疑长篇）'
}

const MODEL_MAP = {
  'GPT-4o': 'gpt-4o',
  'GPT-4o-mini': 'gpt-4o-mini',
  'Claude 3.5 Sonnet': 'gpt-4o',
  'DeepSeek-R1': 'deepseek-chat',
  'Qwen-Max': 'qwen-max',
  'Gemini 2.5 Pro': 'gpt-4o',
}

/**
 * 按项目设置配置客户端
 * @param {Object} settings - project.settings
 */
export function configureAIClient(settings = {}) {
  const apiKey = settings.apiKey || ''
  const base = (settings.apiEndpoint || API_BASE_URL).replace(/\/v1\/?$/, '').replace(/\/$/, '')
  const model = MODEL_MAP[settings.model] || settings.model || AI_MODEL.GPT_4o
  const client = new AIClient(apiKey, model)
  client.baseUrl = `${base}/v1`
  return client
}

// 全局单例客户端
let globalClient = null

/**
 * 获取全局 AI 客户端
 * @param {string} [apiKey] - 可选的 API Key
 * @returns {AIClient}
 */
export function getAIClient(apiKey = null) {
  if (!globalClient || apiKey) {
    globalClient = new AIClient(apiKey || '')
  }
  return globalClient
}