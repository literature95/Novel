// 项目数据结构与默认种子
import { buildDefaultPhases, enrichProject } from './nodes'
import { defaultCollaboration, normalizeCollaboration } from './collaboration'

export const PROJECT_VERSION = 1
export const STORAGE_KEY = 'snowflake-novel-project'

const CHAR_COLORS = ['cerulean', 'rose', 'crimson', 'olive', 'ochre', 'amber']

export function countWords(text = '') {
  return text.replace(/\s/g, '').length
}

export function isValidProject(project) {
  return Boolean(
    project
    && typeof project === 'object'
    && Array.isArray(project.chapters)
    && project.chapters.length > 0
    && Array.isArray(project.characters)
    && Array.isArray(project.constraints)
    && project.scenes
    && typeof project.scenes === 'object'
  )
}

/** 原始种子（不经过 normalize，供 normalize 作默认值） */
function buildProjectBase() {
  return {
    meta: {
      title: '雾隐镇',
      description: '雪花叙事架构示例项目',
      version: PROJECT_VERSION,
      updatedAt: new Date().toISOString(),
    },
    characters: [
      {
        name: '林渊', role: '男主', status: 'alive', color: 'cerulean',
        arc: '逃避创伤的隐居者 → 接受无法拯救所有人的事实',
        background: '前特种兵，三年前目睹队友牺牲，退役后在雾隐镇当护林员',
        progress: 0.15,
        relationships: { '苏婉': '合作关系，逐渐信任', '周深': '表面客气，暗中警惕', '老赵': '忘年交' },
      },
      {
        name: '苏婉', role: '女主', status: 'alive', color: 'rose',
        arc: '理性至上的法医 → 学会相信直觉与情感',
        background: '省厅法医，专业能力极强，但习惯用理性压制情感',
        progress: 0.10,
        relationships: { '林渊': '专业合作，互相观察', '周深': '初次见面' },
      },
      {
        name: '周深', role: '反派', status: 'alive', color: 'crimson',
        arc: '伪善面具下的控制狂 → 被自己的谎言吞噬',
        background: '雾隐镇乡贤，慈善家形象，实际控制镇上多项利益',
        progress: 0.05,
        relationships: { '林渊': '暗中监视', '老赵': '利用其信任' },
      },
      {
        name: '老赵', role: '配角', status: 'alive', color: 'olive',
        arc: '固执的老警察 → 承认自己错过了真相',
        background: '雾隐镇派出所所长，三十年老警察，知道很多但选择性忽视',
        progress: 0.00,
        relationships: { '林渊': '忘年交', '周深': '被蒙蔽' },
      },
    ],
    plotLines: [
      { id: 'main_line', name: '主线', color: 'cerulean', progress: 0.08, milestone: '发现第一具遗体', description: '矿洞遗体引发的悬疑追查' },
      { id: 'relationship_arc', name: '感情线', color: 'rose', progress: 0.05, milestone: '林渊与苏婉初次合作', description: '两个封闭的人逐渐打开心防' },
      { id: 'antagonist_arc', name: '反派线', color: 'crimson', progress: 0.03, milestone: '周深首次暗中行动', description: '周深的伪装逐步崩塌' },
      { id: 'world_arc', name: '世界观', color: 'olive', progress: 0.06, milestone: '矿洞遗迹初次提及', description: '雾隐镇隐藏的历史真相' },
      { id: 'thematic_arc', name: '主题线', color: 'ochre', progress: 0.04, milestone: '林渊拒绝回忆', description: '面对真相的勇气比真相本身更重要' },
    ],
    locations: [
      { id: 'L01', name: '雾隐镇', type: 'town', era: '现代', features: '四面环山，常年薄雾笼罩，以矿业起家', connectedTo: ['废弃矿区', '护林站', '镇公所'], mood: '闭塞而暗流涌动' },
      { id: 'L02', name: '废弃矿区', type: 'wild', era: '现代·遗迹', features: '废弃十年，矿洞口被封锁，但有人暗中活动', connectedTo: ['矿洞深处', '雾隐镇'], mood: '荒凉、危险、暗藏秘密' },
      { id: 'L03', name: '护林站', type: 'building', era: '现代', features: '林渊住所与办公室，简陋但设备齐全', connectedTo: ['雾隐镇', '矿洞入口'], mood: '孤独的守望' },
      { id: 'L04', name: '镇公所', type: 'building', era: '现代', features: '雾隐镇行政中心，周深常在此办公', connectedTo: ['雾隐镇', '周家大宅'], mood: '表面秩序下的权力中心' },
      { id: 'L05', name: '周家大宅', type: 'building', era: '现代·奢华', features: '周深住所，独立大宅，有书房和地下储藏室', connectedTo: ['镇公所'], mood: '精致而阴冷' },
      { id: 'L06', name: '临时解剖室', type: 'building', era: '现代', features: '借用镇卫生院改造，苏婉工作地点', connectedTo: ['雾隐镇'], mood: '冰冷且不容马虎' },
      { id: 'L07', name: '矿洞深处', type: 'underground', era: '遗迹', features: '深处有不明刻痕和符号，岩壁潮湿', connectedTo: ['废弃矿区'], mood: '神秘、压抑、时间停滞' },
      { id: 'L08', name: '山间小径', type: 'route', era: '现代', features: '连接各处的小路，林缘经常巡视的路线', connectedTo: ['护林站', '废弃矿区', '雾隐镇'], mood: '过渡与发现' },
    ],
    magicSystem: [
      { id: 'M01', name: '梦境预兆', type: 'ability', source: '矿区遗迹影响', rules: '只有接触过矿区遗迹的人才会产生梦境；梦境片段模糊，需解读', cost: '每次强烈预兆后头痛欲裂，持续数小时', usage: '林缘通过梦境获得线索，但无法控制', note: '非超能力，更接近矿洞遗留的心理-物理影响' },
      { id: 'M02', name: '符号共鸣', type: 'rule', source: '矿洞刻痕', rules: '特定几何符号在矿洞环境中会发出微弱的荧光', cost: '接触者会产生幻觉/记忆闪回', usage: '作为线索提示与场景氛围', note: '核心设定：符号本身不具力量，但会触发特定人的深层记忆' },
      { id: 'M03', name: '代价法则', type: 'cost', source: '世界观基础规则', rules: '任何通过遗迹获得的信息必须付出相应代价', cost: '心理创伤或生理不适', usage: '防止信息获取过于轻易', note: '与 R-002 约束规则呼应' },
    ],
    timeline: [
      { id: 'T01', year: '1985年', event: '雾隐镇矿场正式开采', era: '矿业时代', characters: [], locations: ['废弃矿区'], significance: '中' },
      { id: 'T02', year: '2005年', event: '矿难发生，7人死亡', era: '矿业时代', characters: [], locations: ['废弃矿区'], significance: '高' },
      { id: 'T03', year: '2006年', event: '矿山正式关闭，矿洞封锁', era: '转型期', characters: [], locations: ['废弃矿区'], significance: '高' },
      { id: 'T04', year: '2010年', event: '周深回到雾隐镇，开始慈善事业', era: '转型期', characters: ['周深'], locations: ['镇公所'], significance: '高' },
      { id: 'T05', year: '2013年', event: '档案室失火，部分旧档案被烧毁', era: '转型期', characters: ['老赵'], locations: ['镇公所'], significance: '中' },
      { id: 'T06', year: '2016年', event: '林渊退伍，到雾隐镇任护林员', era: '现代', characters: ['林渊'], locations: ['护林站'], significance: '中' },
      { id: 'T07', year: '2018年', event: '故事开始：矿洞口发现遗体', era: '现代', characters: ['林渊', '老赵'], locations: ['废弃矿区'], significance: '高' },
    ],
    foreshadows: [
      { id: 'F01', title: '林渊梦中的符号', importance: 0.9, status: 'planted', planted: 'Ch1', deadline: 'Ch18', desc: '林渊反复梦到一个几何符号，与矿洞有关' },
      { id: 'F02', title: '周深办公室的旧照片', importance: 0.7, status: 'planted', planted: 'Ch2', deadline: 'Ch22', desc: '照片中有一张年轻时的合影，背景是矿洞入口' },
      { id: 'F03', title: '苏婉旧伤疤', importance: 0.6, status: 'planted', planted: 'Ch3', deadline: 'Ch25', desc: '苏婉左手腕内侧有一道旧伤疤，她从不解释' },
      { id: 'F04', title: '镇上消失的档案', importance: 0.8, status: 'drafted', planted: '-', deadline: 'Ch12', desc: '警局十年前的案件档案缺失三页' },
      { id: 'F05', title: '误导：凶手是外来者', importance: 0.5, status: 'drafted', planted: '-', deadline: 'Ch30', desc: '前期线索指向外来流窜犯，实为误导' },
    ],
    constraints: [
      { id: 'R-001', type: 'absolute', name: '已死角色不能出场', desc: '除非明确标记为闪回/回忆场景' },
      { id: 'R-002', type: 'absolute', name: '能力使用必须有代价', desc: '任何力量体系中的能力不得免费使用' },
      { id: 'R-003', type: 'absolute', name: '时间线因果不可逆', desc: '事件B依赖事件A时，A必须在B之前' },
      { id: 'R-004', type: 'soft', name: '高潮后必须呼吸', desc: '连续3章 momentum>0.8 后必须插入低节奏章' },
      { id: 'R-005', type: 'soft', name: 'POV连续不超过2章', desc: '同一视角人物连续出现不超过2章' },
      { id: 'R-006', type: 'guideline', name: '角色失踪需提及', desc: '主要角色消失超过10章需在对话或内心中提及' },
    ],
    phases: buildDefaultPhases(),
    staleMarkers: {},
    collaboration: {
      ...defaultCollaboration(),
      mode: 'solo',
      notes: '单人创作：按五线自行推进；切换「多人协同」可启用 N-3.1 / N-6.3 完整编辑。',
      writers: [
        { id: 'w1', name: '主笔', responsibleLines: ['main_line', 'thematic_arc'], color: 'cerulean' },
        { id: 'w2', name: '协作者', responsibleLines: ['relationship_arc'], color: 'rose' },
      ],
      chapterAssignments: [
        { chapterId: 1, primaryWriterId: 'w1', collaboratorIds: [], status: 'done' },
        { chapterId: 2, primaryWriterId: 'w1', collaboratorIds: ['w2'], status: 'done' },
        { chapterId: 3, primaryWriterId: 'w2', collaboratorIds: ['w1'], status: 'review' },
        { chapterId: 4, primaryWriterId: 'w1', collaboratorIds: [], status: 'draft' },
      ],
      handoverNotes: [
        {
          id: 'h01',
          fromWriterId: 'w1',
          toWriterId: 'w2',
          chapterId: 3,
          content: 'Ch3 法医线请接苏婉 POV，注意 F03 伤疤伏笔。',
          date: '2026-05-01',
        },
      ],
      syncLog: [
        {
          id: 's01',
          date: '2026-05-18',
          syncedLines: ['main_line', 'relationship_arc'],
          conflictNotes: '',
        },
      ],
    },
    chapters: [
      { id: 1, title: '雾隐镇的清晨', status: 'done', words: 3240, targetWords: 3000, scenes: 3,
        characters: ['林渊', '老赵'], locations: ['雾隐镇', '护林站'],
        plotLines: ['main_line', 'world_arc'], momentum: 0.3, emotionPeak: 0.4 },
      { id: 2, title: '矿洞边缘', status: 'done', words: 3100, targetWords: 3000, scenes: 3,
        characters: ['林渊', '周深'], locations: ['废弃矿区', '镇公所'],
        plotLines: ['main_line', 'antagonist_arc'], momentum: 0.4, emotionPeak: 0.5 },
      { id: 3, title: '法医抵达', status: 'done', words: 2900, targetWords: 3000, scenes: 3,
        characters: ['苏婉', '林渊', '老赵'], locations: ['雾隐镇', '案发现场'],
        plotLines: ['main_line', 'relationship_arc'], momentum: 0.5, emotionPeak: 0.5 },
      { id: 4, title: '第一个疑点', status: 'progress', words: 1200, targetWords: 3000, scenes: 2,
        characters: ['苏婉', '林渊'], locations: ['临时解剖室'],
        plotLines: ['main_line', 'relationship_arc', 'thematic_arc'], momentum: 0.6, emotionPeak: 0.6 },
      { id: 5, title: '暗流', status: 'locked', words: 0, targetWords: 3000, scenes: 0,
        characters: ['周深'], locations: ['镇公所', '周家大宅'],
        plotLines: ['antagonist_arc', 'world_arc'], momentum: 0.5, emotionPeak: 0.5 },
      { id: 6, title: '旧伤', status: 'locked', words: 0, targetWords: 3000, scenes: 0,
        characters: ['林渊'], locations: ['护林站', '林渊住所'],
        plotLines: ['main_line', 'thematic_arc'], momentum: 0.4, emotionPeak: 0.7 },
    ],
    scenes: {
      1: [
        { id: 'ch1_s1', title: '护林站的黎明', pov: '林渊', setting: '护林站·室内',
          content: '晨光从百叶窗的缝隙中挤进来，在地板上画出一道道平行的光痕。\n\n林渊已经醒了两个小时。不是被噩梦惊醒——他已经很久不做那个梦了——而是一种说不清的不安，像一根针扎在后脑勺，不痛，但始终在那里。\n\n他给自己倒了杯水，站在窗前。雾隐镇还在沉睡，远处的山脊线被一层薄雾遮住，看不清轮廓。\n\n对讲机响了。\n\n"林渊，矿洞那边……你最好过来看看。"老赵的声音带着一种他从未听过的颤抖。',
          beats: ['晨光中醒来', '对讲机响起', '老赵语气异常', '林渊出门'],
          conflict: { type: ['内心冲突'], intensity: 0.3, turningPoint: false, resolution: '林渊压下不安前往矿洞' },
          foreshadow: { planted: ['F01'], triggered: [], resolved: [] } },
        { id: 'ch1_s2', title: '矿洞现场', pov: '林渊', setting: '废弃矿洞入口',
          content: '矿洞入口被警戒线围了起来。林渊到的时候，老赵已经蹲在一块岩石旁边，脸色发白。\n\n"你看这个。"\n\n岩石后面是一具遗体，已经面目全非。但引起林渊注意的不是遗体本身——而是岩壁上的刻痕。\n\n那些线条。\n\n他的手开始发抖。\n\n那是他在梦里见过无数次的符号。',
          beats: ['到达现场', '看到遗体', '发现岩壁刻痕', '认出梦中符号', '身体反应'],
          conflict: { type: ['内心冲突', '外部威胁'], intensity: 0.7, turningPoint: true, resolution: '林渊意识到梦与现实的联系' },
          foreshadow: { planted: [], triggered: ['F01'], resolved: [] } },
        { id: 'ch1_s3', title: '报信', pov: '老赵', setting: '雾隐镇·警局',
          content: '老赵拨通了县局的电话，请求法医支援。挂断后他坐在椅子上，看着窗外的雾，手里的烟烧到了手指都没察觉。\n\n三十年了。三十年没有出过这种事。\n\n他想起十年前那份怎么也找不到的档案，心里像被什么东西堵住了。',
          beats: ['申请法医支援', '回忆往事', '暗示档案缺失', '不安蔓延'],
          conflict: { type: ['内心冲突'], intensity: 0.35, turningPoint: false, resolution: '老赵选择相信程序' },
          foreshadow: { planted: ['F04'], triggered: [], resolved: [] } },
      ],
      2: [
        { id: 'ch2_s1', title: '来访者', pov: '林渊', setting: '镇公所',
          content: '周深比法医先到了。\n\n他穿着一件灰色的羊绒大衣，站在镇公所的台阶上，像是从另一个世界来的。林渊注意到他看向矿洞方向的时候，眼神有一个极短暂的停顿——不到半秒——然后恢复了那种惯常的温和微笑。\n\n"林护林员，听说矿洞那边出了事？镇上需要什么帮助，尽管开口。"\n\n他的声音很稳，稳得不像是在关心，更像是在确认。',
          beats: ['周深登场', '林渊观察到微表情', '周深表态资助', '林渊产生警觉'],
          conflict: { type: ['人际冲突'], intensity: 0.5, turningPoint: false, resolution: '双方维持表面客气' },
          foreshadow: { planted: ['F02'], triggered: [], resolved: [] } },
        { id: 'ch2_s2', title: '废弃矿区', pov: '林渊', setting: '矿洞深处',
          content: '林渊独自回到矿洞。不是作为护林员的职责，而是为了再看一眼那些刻痕。\n\n手电筒的光柱在潮湿的岩壁上移动。他找到了那些线条，蹲下来，用手指描摹它们的纹路。\n\n石头冰凉。线条很深，不像是自然风化，更像是被某种工具——或者指甲——硬生生刻上去的。\n\n在刻痕旁边的岩缝里，他看到了一样东西。\n\n一枚铜扣，已经锈蚀得几乎认不出原来的形状。但林渊认得——那是制式军服上的扣子。\n\n和他的战友穿的一样。',
          beats: ['重返矿洞', '描摹刻痕', '发现铜扣', '联想到战友'],
          conflict: { type: ['内心冲突'], intensity: 0.65, turningPoint: true, resolution: '林渊决定追查到底' },
          foreshadow: { planted: [], triggered: ['F01'], resolved: [] } },
      ],
      3: [
        { id: 'ch3_s1', title: '法医到来', pov: '苏婉', setting: '雾隐镇·临时解剖室',
          content: '苏婉不喜欢小镇。每一个小镇都有秘密，而秘密会腐烂，腐烂的东西最终都会摆到她的解剖台上。\n\n她从车上卸下设备箱的时候，感觉有人在看她。抬头，一个男人站在护林站的台阶上，逆着光，看不清脸。\n\n"你是法医？"他走过来，伸出手。手上有旧茧，很厚。\n\n"苏婉。"\n\n"林渊。"\n\n他们的第一次握手很短。苏婉注意到他左手无名指有一个旧伤，她职业性地记住了这个细节。',
          beats: ['苏婉视角开启', '到达小镇', '与林渊初见', '互相观察'],
          conflict: { type: ['人际冲突'], intensity: 0.3, turningPoint: false, resolution: '专业关系建立' },
          foreshadow: { planted: ['F03'], triggered: [], resolved: [] } },
      ],
    },
    acts: [
      { name: '第一幕', range: '0–25%', goal: '建立世界与悬念，引出核心谜团', curve: '平静 → 不安 → 震惊', twist: '矿洞符号与林渊梦境的联系', width: 25 },
      { name: '第二幕', range: '25–75%', goal: '真相逐步揭露，代价越来越大', curve: '探索 → 发现 → 代价 → 崩溃', twist: '周深的真实身份', width: 50 },
      { name: '第三幕', range: '75–100%', goal: '最终面对与抉择', curve: '绝望 → 领悟 → 行动 → 余波', twist: '', width: 25 },
    ],
    settings: {
      model: 'GPT-4o',
      apiEndpoint: 'https://api.openai.com/v1',
      apiKey: '',
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 4096,
      contextStrategy: '智能裁剪（推荐）',
      style: '文学性细腻',
      language: '简体中文',
      sceneLength: '1200-2000 字（标准）',
      pov: '第三人称有限',
      autoValidate: '每次生成后自动校验',
      foreshadowAlert: '超过2章提醒',
    },
    volumes: [
      { id: 'v1', name: '第一册：谜团初现', range: 'Ch1–Ch20', chapters: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20], hook: 'Ch1 矿洞遗体', midpoint: 'Ch10', climax: 'Ch18', desc: '建立世界观，引出核心谜团' },
      { id: 'v2', name: '第二册：真相逼近', range: 'Ch21–Ch40', chapters: [21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40], hook: 'Ch21', midpoint: 'Ch30', climax: 'Ch38', desc: '真相逐步揭露，代价越来越大' },
      { id: 'v3', name: '第三册：终局对决', range: 'Ch41–Ch60', chapters: [41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60], hook: 'Ch41', midpoint: 'Ch50', climax: 'Ch58', desc: '最终面对与抉择' },
    ],
    staleMarkers: {},
  }
}

let _seedCache = null

export function resetSeedCache() {
  _seedCache = null
}

function normalizeScenesMap(scenes, fallback = {}) {
  const src =
    scenes != null && typeof scenes === 'object' && !Array.isArray(scenes)
      ? scenes
      : fallback != null && typeof fallback === 'object' && !Array.isArray(fallback)
        ? fallback
        : {}
  const out = {}
  for (const [key, val] of Object.entries(src)) {
    out[Number(key)] = val
  }
  return out
}

function getSeedDefaults() {
  if (!_seedCache || !isValidProject(_seedCache)) {
    const base = buildProjectBase()
    const enriched = enrichProject(base)
    _seedCache = isValidProject(enriched) ? enriched : base
  }
  return _seedCache
}

export function createDefaultProject() {
  resetSeedCache()
  return getSeedDefaults()
}

/** 合并旧版/残缺导入数据与默认结构 */
export function normalizeProject(raw) {
  const defaults = getSeedDefaults()
  if (!raw || typeof raw !== 'object') {
    return defaults
  }

  // 已是完整项目时直接返回，避免二次 normalize 破坏数据
  if (isValidProject(raw) && raw.meta?.title) {
    return raw
  }

  const source = raw.project && typeof raw.project === 'object' ? raw.project : raw
  const fallbackScenes = defaults.scenes ?? {}
  const normalizedScenes = normalizeScenesMap(
    source.scenes ?? source.SCENES,
    fallbackScenes
  )

  const merged = {
    meta: { ...defaults.meta, ...source.meta },
    characters: source.characters ?? source.CHARACTERS ?? defaults.characters,
    plotLines: source.plotLines ?? source.PLOT_LINES ?? defaults.plotLines,
    foreshadows: source.foreshadows ?? source.FORESHADOWS ?? defaults.foreshadows,
    constraints: source.constraints ?? source.CONSTRAINTS ?? defaults.constraints,
    phases: source.phases ?? source.PHASES ?? defaults.phases,
    chapters: source.chapters ?? source.CHAPTERS ?? defaults.chapters,
    volumes: source.volumes ?? source.VOLUMES ?? defaults.volumes,
    scenes: Object.keys(normalizedScenes).length ? normalizedScenes : fallbackScenes,
    acts: source.acts ?? source.ACTS ?? defaults.acts,
    settings: { ...defaults.settings, ...source.settings },
    staleMarkers: source.staleMarkers ?? defaults.staleMarkers ?? {},
    collaboration: normalizeCollaboration({ ...defaults.collaboration, ...source.collaboration }),
  }
  if (!Array.isArray(merged.chapters) || merged.chapters.length === 0) {
    merged.chapters = defaults.chapters
  }
  if (!Array.isArray(merged.volumes) || merged.volumes.length === 0) {
    merged.volumes = defaults.volumes
  }
  if (!Array.isArray(merged.characters)) merged.characters = defaults.characters
  if (!Array.isArray(merged.constraints)) merged.constraints = defaults.constraints
  if (!merged.scenes || typeof merged.scenes !== 'object') {
    merged.scenes = fallbackScenes
  }
  const enriched = enrichProject(merged)
  if (isValidProject(enriched)) return enriched
  if (isValidProject(merged)) return merged
  return defaults
}

export function nextConstraintId(constraints) {
  const nums = constraints
    .map(c => /^R-(\d+)$/.exec(c.id))
    .filter(Boolean)
    .map(m => Number(m[1]))
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `R-${String(next).padStart(3, '0')}`
}

export function createBlankCharacter(existing) {
  const used = new Set(existing.map(c => c.name))
  let n = 1
  while (used.has(`新角色${n}`)) n++
  const color = CHAR_COLORS[existing.length % CHAR_COLORS.length]
  return {
    name: `新角色${n}`,
    role: '配角',
    status: 'alive',
    color,
    arc: '',
    background: '',
    progress: 0,
    relationships: {},
  }
}

export function applyProjectPatch(state, patch) {
  return enrichProject({ ...state, ...patch })
}

export function syncChapterStats(chapters, scenes) {
  return chapters.map(ch => {
    const chapterScenes = scenes[ch.id] || []
    const words = chapterScenes.reduce((sum, s) => sum + countWords(s.content), 0)
    return { ...ch, words, scenes: chapterScenes.length }
  })
}

export function buildExportPayload(project) {
  return {
    ...project,
    meta: {
      ...project.meta,
      exportedAt: new Date().toISOString(),
    },
  }
}
