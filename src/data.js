// src/data.js

export const CHARACTERS = [
  {
    name: '林渊', role: '男主', status: 'alive', color: 'cerulean',
    arc: '逃避创伤的隐居者 → 接受无法拯救所有人的事实',
    background: '前特种兵，三年前目睹队友牺牲，退役后在雾隐镇当护林员',
    progress: 0.15,
    relationships: { '苏婉': '合作关系，逐渐信任', '周深': '表面客气，暗中警惕', '老赵': '忘年交' }
  },
  {
    name: '苏婉', role: '女主', status: 'alive', color: 'rose',
    arc: '理性至上的法医 → 学会相信直觉与情感',
    background: '省厅法医，专业能力极强，但习惯用理性压制情感',
    progress: 0.10,
    relationships: { '林渊': '专业合作，互相观察', '周深': '初次见面' }
  },
  {
    name: '周深', role: '反派', status: 'alive', color: 'crimson',
    arc: '伪善面具下的控制狂 → 被自己的谎言吞噬',
    background: '雾隐镇乡贤，慈善家形象，实际控制镇上多项利益',
    progress: 0.05,
    relationships: { '林渊': '暗中监视', '老赵': '利用其信任' }
  },
  {
    name: '老赵', role: '配角', status: 'alive', color: 'olive',
    arc: '固执的老警察 → 承认自己错过了真相',
    background: '雾隐镇派出所所长，三十年老警察，知道很多但选择性忽视',
    progress: 0.00,
    relationships: { '林渊': '忘年交', '周深': '被蒙蔽' }
  }
]

export const PLOT_LINES = [
  { id: 'main_line', name: '主线', color: 'cerulean', progress: 0.08, milestone: '发现第一具遗体', description: '矿洞遗体引发的悬疑追查' },
  { id: 'relationship_arc', name: '感情线', color: 'rose', progress: 0.05, milestone: '林渊与苏婉初次合作', description: '两个封闭的人逐渐打开心防' },
  { id: 'antagonist_arc', name: '反派线', color: 'crimson', progress: 0.03, milestone: '周深首次暗中行动', description: '周深的伪装逐步崩塌' },
  { id: 'world_arc', name: '世界观', color: 'olive', progress: 0.06, milestone: '矿洞遗迹初次提及', description: '雾隐镇隐藏的历史真相' },
  { id: 'thematic_arc', name: '主题线', color: 'ochre', progress: 0.04, milestone: '林渊拒绝回忆', description: '面对真相的勇气比真相本身更重要' }
]

export const FORESHADOWS = [
  { id: 'F01', title: '林渊梦中的符号', importance: 0.9, status: 'planted', planted: 'Ch1', deadline: 'Ch18', desc: '林渊反复梦到一个几何符号，与矿洞有关' },
  { id: 'F02', title: '周深办公室的旧照片', importance: 0.7, status: 'planted', planted: 'Ch2', deadline: 'Ch22', desc: '照片中有一张年轻时的合影，背景是矿洞入口' },
  { id: 'F03', title: '苏婉旧伤疤', importance: 0.6, status: 'planted', planted: 'Ch3', deadline: 'Ch25', desc: '苏婉左手腕内侧有一道旧伤疤，她从不解释' },
  { id: 'F04', title: '镇上消失的档案', importance: 0.8, status: 'drafted', planted: '-', deadline: 'Ch12', desc: '警局十年前的案件档案缺失三页' },
  { id: 'F05', title: '误导：凶手是外来者', importance: 0.5, status: 'drafted', planted: '-', deadline: 'Ch30', desc: '前期线索指向外来流窜犯，实为误导' }
]

export const CONSTRAINTS = [
  { id: 'R-001', type: 'absolute', name: '已死角色不能出场', desc: '除非明确标记为闪回/回忆场景' },
  { id: 'R-002', type: 'absolute', name: '能力使用必须有代价', desc: '任何力量体系中的能力不得免费使用' },
  { id: 'R-003', type: 'absolute', name: '时间线因果不可逆', desc: '事件B依赖事件A时，A必须在B之前' },
  { id: 'R-004', type: 'soft', name: '高潮后必须呼吸', desc: '连续3章 momentum>0.8 后必须插入低节奏章' },
  { id: 'R-005', type: 'soft', name: 'POV连续不超过2章', desc: '同一视角人物连续出现不超过2章' },
  { id: 'R-006', type: 'guideline', name: '角色失踪需提及', desc: '主要角色消失超过10章需在对话或内心中提及' }
]

export const PHASES = [
  { id: 1, name: '世界观与规则构建', status: 'done', nodes: [
    { id: '1.1', name: '角色库', desc: '主要角色档案、人物弧线、关系网', status: 'done', count: 4, icon: 'Users' },
    { id: '1.2', name: '地点库', desc: '场景地点、地理关系、出现规则', status: 'done', count: 7, icon: 'MapPin' },
    { id: '1.3', name: '力量体系', desc: '超自然能力定义、代价与约束', status: 'done', count: 5, icon: 'Zap' },
    { id: '1.4', name: '时间线', desc: '历史纪年与关键事件编年', status: 'done', count: 3, icon: 'Calendar' },
    { id: '1.5', name: '约束规则库', desc: '硬规则、软规则、写作指南', status: 'done', count: 12, icon: 'Shield' }
  ]},
  { id: 2, name: '全局叙事规划', status: 'done', nodes: [
    { id: '2.1', name: '三幕结构', desc: '宏观节奏、情感曲线、中点反转', status: 'done', count: 3, icon: 'Clapperboard' },
    { id: '2.2', name: '五线规划', desc: '主线/感情/反派/世界观/主题 五线里程碑', status: 'done', count: 5, icon: 'GitBranch' },
    { id: '2.3', name: '伏笔网设计', desc: '伏笔节点、因果/强化/矛盾/铺垫边', status: 'done', count: 15, icon: 'Network' }
  ]},
  { id: 3, name: '协同任务分配', status: 'skip', nodes: [
    { id: '3.1', name: '协同面板', desc: '作者分配、章节归属、交接日志', status: 'skip', count: 0, icon: 'UsersRound' }
  ]},
  { id: 4, name: '分册章节蓝图', status: 'progress', nodes: [
    { id: '4.1', name: '分册骨架', desc: '三册划分、钩子/中点/高潮场景标记', status: 'done', count: 3, icon: 'BookOpen' },
    { id: '4.2', name: '逐章大纲', desc: '60章完整大纲含元数据', status: 'progress', count: 6, icon: 'ListChecks' }
  ]},
  { id: 5, name: '场景迭代写作', status: 'progress', nodes: [
    { id: '5.1', name: '场景生成循环', desc: '生成 → 校验 → 人工确认 → 锁定写入', status: 'progress', count: 9, icon: 'PenTool' }
  ]},
  { id: 6, name: '实时校验与协同调整', status: 'progress', nodes: [
    { id: '6.1', name: '伏笔看板', desc: '超期告警、回收推荐、状态统计', status: 'progress', count: 3, icon: 'Pin' },
    { id: '6.2', name: '约束扫描', desc: '绝对规则检查、软规则建议', status: 'done', count: 12, icon: 'Search' },
    { id: '6.3', name: '协同同步', desc: '多作者交接日志、冲突检测', status: 'skip', count: 0, icon: 'RefreshCw' }
  ]},
  { id: 7, name: '修订闭环与交付', status: 'locked', nodes: [
    { id: '7.1', name: '伏笔终审', desc: '全伏笔回收率审查', status: 'locked', count: 0, icon: 'Target' },
    { id: '7.2', name: '弧线完成度', desc: '角色弧线+叙事线完成度审计', status: 'locked', count: 0, icon: 'TrendingUp' },
    { id: '7.3', name: '规则清零', desc: 'inconsistency_log 残留清零', status: 'locked', count: 0, icon: 'CheckCircle' },
    { id: '7.4', name: '终审报告', desc: '健康度评分、修订优先级、交付决策', status: 'locked', count: 0, icon: 'FileText' }
  ]}
]

export const CHAPTERS = [
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
    plotLines: ['main_line', 'thematic_arc'], momentum: 0.4, emotionPeak: 0.7 }
]

export const SCENES = {
  1: [
    { id: 'ch1_s1', title: '护林站的黎明', pov: '林渊', setting: '护林站·室内',
      content: '晨光从百叶窗的缝隙中挤进来，在地板上画出一道道平行的光痕。\n\n林渊已经醒了两个小时。不是被噩梦惊醒——他已经很久不做那个梦了——而是一种说不清的不安，像一根针扎在后脑勺，不痛，但始终在那里。\n\n他给自己倒了杯水，站在窗前。雾隐镇还在沉睡，远处的山脊线被一层薄雾遮住，看不清轮廓。\n\n对讲机响了。\n\n"林渊，矿洞那边……你最好过来看看。"老赵的声音带着一种他从未听过的颤抖。',
      beats: ['晨光中醒来', '对讲机响起', '老赵语气异常', '林渊出门'],
      conflict: { type: ['内心冲突'], intensity: 0.3, turningPoint: false, resolution: '林渊压下不安前往矿洞' },
      foreshadow: { planted: ['F01'], triggered: [], resolved: [] }
    },
    { id: 'ch1_s2', title: '矿洞现场', pov: '林渊', setting: '废弃矿洞入口',
      content: '矿洞入口被警戒线围了起来。林渊到的时候，老赵已经蹲在一块岩石旁边，脸色发白。\n\n"你看这个。"\n\n岩石后面是一具遗体，已经面目全非。但引起林渊注意的不是遗体本身——而是岩壁上的刻痕。\n\n那些线条。\n\n他的手开始发抖。\n\n那是他在梦里见过无数次的符号。',
      beats: ['到达现场', '看到遗体', '发现岩壁刻痕', '认出梦中符号', '身体反应'],
      conflict: { type: ['内心冲突', '外部威胁'], intensity: 0.7, turningPoint: true, resolution: '林渊意识到梦与现实的联系' },
      foreshadow: { planted: [], triggered: ['F01'], resolved: [] }
    },
    { id: 'ch1_s3', title: '报信', pov: '老赵', setting: '雾隐镇·警局',
      content: '老赵拨通了县局的电话，请求法医支援。挂断后他坐在椅子上，看着窗外的雾，手里的烟烧到了手指都没察觉。\n\n三十年了。三十年没有出过这种事。\n\n他想起十年前那份怎么也找不到的档案，心里像被什么东西堵住了。',
      beats: ['申请法医支援', '回忆往事', '暗示档案缺失', '不安蔓延'],
      conflict: { type: ['内心冲突'], intensity: 0.35, turningPoint: false, resolution: '老赵选择相信程序' },
      foreshadow: { planted: ['F04'], triggered: [], resolved: [] }
    }
  ],
  2: [
    { id: 'ch2_s1', title: '来访者', pov: '林渊', setting: '镇公所',
      content: '周深比法医先到了。\n\n他穿着一件灰色的羊绒大衣，站在镇公所的台阶上，像是从另一个世界来的。林渊注意到他看向矿洞方向的时候，眼神有一个极短暂的停顿——不到半秒——然后恢复了那种惯常的温和微笑。\n\n"林护林员，听说矿洞那边出了事？镇上需要什么帮助，尽管开口。"\n\n他的声音很稳，稳得不像是在关心，更像是在确认。',
      beats: ['周深登场', '林渊观察到微表情', '周深表态资助', '林渊产生警觉'],
      conflict: { type: ['人际冲突'], intensity: 0.5, turningPoint: false, resolution: '双方维持表面客气' },
      foreshadow: { planted: ['F02'], triggered: [], resolved: [] }
    },
    { id: 'ch2_s2', title: '废弃矿区', pov: '林渊', setting: '矿洞深处',
      content: '林渊独自回到矿洞。不是作为护林员的职责，而是为了再看一眼那些刻痕。\n\n手电筒的光柱在潮湿的岩壁上移动。他找到了那些线条，蹲下来，用手指描摹它们的纹路。\n\n石头冰凉。线条很深，不像是自然风化，更像是被某种工具——或者指甲——硬生生刻上去的。\n\n在刻痕旁边的岩缝里，他看到了一样东西。\n\n一枚铜扣，已经锈蚀得几乎认不出原来的形状。但林渊认得——那是制式军服上的扣子。\n\n和他的战友穿的一样。',
      beats: ['重返矿洞', '描摹刻痕', '发现铜扣', '联想到战友'],
      conflict: { type: ['内心冲突'], intensity: 0.65, turningPoint: true, resolution: '林渊决定追查到底' },
      foreshadow: { planted: [], triggered: ['F01'], resolved: [] }
    }
  ],
  3: [
    { id: 'ch3_s1', title: '法医到来', pov: '苏婉', setting: '雾隐镇·临时解剖室',
      content: '苏婉不喜欢小镇。每一个小镇都有秘密，而秘密会腐烂，腐烂的东西最终都会摆到她的解剖台上。\n\n她从车上卸下设备箱的时候，感觉有人在看她。抬头，一个男人站在护林站的台阶上，逆着光，看不清脸。\n\n"你是法医？"他走过来，伸出手。手上有旧茧，很厚。\n\n"苏婉。"\n\n"林渊。"\n\n他们的第一次握手很短。苏婉注意到他左手无名指有一个旧伤，她职业性地记住了这个细节。',
      beats: ['苏婉视角开启', '到达小镇', '与林渊初见', '互相观察'],
      conflict: { type: ['人际冲突'], intensity: 0.3, turningPoint: false, resolution: '专业关系建立' },
      foreshadow: { planted: ['F03'], triggered: [], resolved: [] }
    }
  ]
}

export const ACTS = [
  { name: '第一幕', range: '0–25%', goal: '建立世界与悬念，引出核心谜团', curve: '平静 → 不安 → 震惊', twist: '矿洞符号与林渊梦境的联系', width: 25 },
  { name: '第二幕', range: '25–75%', goal: '真相逐步揭露，代价越来越大', curve: '探索 → 发现 → 代价 → 崩溃', twist: '周深的真实身份', width: 50 },
  { name: '第三幕', range: '75–100%', goal: '最终面对与抉择', curve: '绝望 → 领悟 → 行动 → 余波', twist: '', width: 25 }
]
