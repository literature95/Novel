## 📖 项目简介

Novel 是一个集 **AI 辅助写作**、**小说管理**、**角色设计**、**世界观构建**于一体的全功能小说创作平台。基于 **Snowflake Novel Architecture v2.0（雪花叙事架构）**，提供从世界观构建→全局叙事规划→章节蓝图→场景迭代写作→实时校验→修订交付的完整 7 阶段创作管线。通过先进的 AI 技术，帮助作家快速生成灵感、完善剧情、管理故事世界。

## ✨ 核心功能

### ❄️ 雪花叙事架构 v2.0（7 阶段创作管线）

#### 阶段一：世界观与规则构建 ✅
- **角色库** (N-1.1)：创建角色档案，定义人物弧线（arc）、成长轨迹、关系网
- **地点库** (N-1.2)：管理场景地点，含类型、时代、氛围、互连关系
- **力量体系** (N-1.3)：定义超自然能力、规则、代价与来源
- **时间线** (N-1.4)：历史纪年与关键事件编年，含时代标签与重要性分级
- **约束规则库** (N-1.5)：硬规则（absolute）与软规则（soft）双轨制，写作指南管理

#### 阶段二：全局叙事规划 ✅
- **三幕结构**：宏观节奏、情感曲线、中点反转设计
- **五线规划**：主线、感情线、反派线、世界观线、主题线，含里程碑与进度追踪
- **伏笔网设计** (N-2.3)：伏笔节点（F01–Fn）完整管理界面，支持添加/编辑/删除伏笔，含种植/触发/回收生命周期、重要度分级、deadline 设置

#### 阶段三：协同任务分配
- **协同面板**：作者分配、章节归属、交接日志

#### 阶段四：分册章节蓝图 ✅
- **分册骨架** (N-4.1)：多册划分管理界面，支持添加/编辑/删除分册，含钩子/中点/高潮场景标记、章节范围设置
- **逐章大纲** (N-4.2)：章节完整编辑界面，支持 POV、地点、目标字数、状态管理，以及叙事线关联

#### 阶段五：场景迭代写作 ✅
- **场景生成循环** (N-5.1)：生成 → 校验 → 人工确认 → 锁定写入，支持场景添加/删除管理
- **场景节拍（Beats）**：每个场景拆解为 4–6 个叙事节拍
- **冲突类型声明**：内心冲突、人际冲突、外部威胁等
- **五维进度跟踪**：感情、剧情、悬疑、世界观、角色维度实时进度条

#### 阶段六：实时校验与协同调整 ✅
- **伏笔看板** (N-6.1)：超期告警、回收推荐、状态统计，含回收率、状态分布可视化、即将到期提示
- **约束扫描**：绝对规则检查（如"已死角色不能出场"）、软规则建议
- **校验清单**：POV 角色存活、地点在知识图谱中、冲突类型已声明、五线进度单调递增、伏笔状态转换合法

#### 阶段七：修订闭环与交付 ✅
- **伏笔终审** (N-7.1)：全伏笔回收率审查
- **弧线完成度** (N-7.2)：角色弧线 + 叙事线完成度审计
- **规则清零** (N-7.3)：inconsistency_log 残留清零
- **终审报告** (N-7.4)：健康度综合评分、修订优先级、交付决策

### 📝 AI 写作工具
- **场景级 AI 生成**：基于上下文（角色档案 + 活跃伏笔 + 前一场景摘要）智能生成场景 JSON
- **沉浸式编辑器**：支持场景内容书写，含节拍（Beats）拆分
- **自动校验**：生成后自动执行六项校验规则
- **AI 模型配置**：API Key、Model、Temperature、Top P、Max Tokens 参数调优
- **写作风格选择**：文学性细腻 / 简洁明快 / 悬疑紧凑 / 古典优雅 / 口语化生动

### 📚 小说管理
- **章节管理**：创建、编辑、删除、排序章节，每章无数据（字数、场景数、进度）
- **场景管理**：POV 视角、场景设置、叙事节拍逐项管理
- **内容导出**：支持 JSON 格式导出完整项目（含角色+五线+伏笔+章节）
- **写作统计**：实时显示总字数、章节数、伏笔回收数

### 🎭 角色设计
- **角色档案**：含角色弧线（arc progress）与成长轨迹追踪
- **角色状态**：alive / dead 状态管理
- **关系网**：角色出场关系可视化

### 🌍 世界观构建
- **地点库**：管理故事中的重要场景地点
- **力量体系**：超自然能力定义与约束规则
- **时间线**：故事历史纪年与关键事件

### ❄️ 雪花叙事架构 v2.0
- **7 阶段创作管线**：世界观构建 → 叙事规划 → 协同分配 → 章节蓝图 → 场景迭代 → 实时校验 → 修订交付
- **五线叙事规划**：主线 / 感情线 / 反派线 / 世界观线 / 主题线，含里程碑与进度追踪
- **伏笔网系统**：种植（planted）→ 触发（triggered）→ 回收（resolved）全生命周期管理，含 deadline 超期告警
- **场景节拍（Beats）**：每个场景拆解为 4–6 个叙事节拍，精确到叙事单元
- **冲突类型系统**：内心冲突 / 人际冲突 / 外部威胁，含强度评分与转折标记
- **约束规则库**：硬规则（absolute）与软规则（soft）双轨，含规则扫描引擎
- **场景校验系统**：6 项自动化校验（POV 存活 / 地点存在 / 冲突声明 / 五线单调 / 伏笔状态合法 / 新伏笔 deadline）
- **五维进度条**：感情 / 剧情 / 悬疑 / 世界观 / 角色 维度实时可视化
- **章节元数据**：每章含 momentum（节奏动量）与 emotionPeak（情感峰值）评分
- **JSON 完整导出**：含 project + characters + plot_lines + foreshadows + chapters



## 🛠 技术栈

### 前端
框架：React/Vite 架构
UI 组件：React 19 + Tailwind CSS 4
状态管理：React Context + useReducer
富文本编辑器：Tiptap 3.x (ProseMirror)
数据可视化：ECharts 5.x (伏笔网络图 / 角色关系图 / 情绪曲线)
进度绘制：Canvas API (五线进度条，零依赖)
图标库：Lucide React
字体：Noto Serif SC + Playfair Display + DM Mono

### 后端
API：Next.js API Routes (App Router Route Handlers)
数据库：SQLite (个人创作) / PostgreSQL (团队协作)
ORM：Prisma
认证：JWT (jose)
文件存储：本地文件系统 (JSON 导入/导出)

### AI 服务
接口标准：OpenAI 兼容接口 (Chat Completions API)
支持模型：GPT-4o / Claude 3.5 Sonnet / DeepSeek-R1 / Qwen-Max / Gemini 2.5 Pro
核心功能：
结构化数据生成 (自然语言 → JSON Schema 自动填充)
场景迭代写作 (上下文编排 → 场景生成 → 自动拆解 beats/冲突/伏笔)
约束校验引擎 (硬规则检查 + 软规则建议)
伏笔状态监控 (状态机驱动，超期告警 + 回收推荐)
节奏分析 (情绪曲线与模板比对)

### 架构设计
数据模型：Snowflake Novel Architecture v2.0 (JSON Schema 定义)
流程引擎：七阶段节点图 (世界观构建 → 叙事规划 → 协同分配 → 章节蓝图 → 场景写作 → 实时校验 → 终审交付)
上下文管理：Context Orchestrator (智能裁剪，单次请求 ≤ 8KB)
伏笔状态机：drafted → planted → reinforced → partially_revealed → resolved (支持 misled / abandoned 分支)
约束分级：absolute (硬阻断) / soft (警告) / guideline (参考)

实时协作 (Phase 2)
通信协议：WebSocket API
协作引擎：Yjs (CRDT) + y-websocket
编辑器扩展：@tiptap/extension-collaboration + collaboration-cursor

### 部署    
容器化：Docker
托管：Vercel / 自部署
边缘函数：Cloudflare Workers (AI API 代理)

### 架构总览
┌─────────────────────────────────────────────────────┐
│                   浏览器 (Client)                     │
│                                                     │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │ Structure   │ │ Content      │ │ Settings     │ │
│  │ View        │ │ View         │ │ View         │ │
│  │             │ │              │ │              │ │
│  │ ECharts     │ │ Tiptap       │ │ Model Config │ │
│  │ Canvas      │ │ MetaPanel    │ │ Params       │ │
│  │ PhaseTabs   │ │ Validation   │ │ Style        │ │
│  └──────┬──────┘ └──────┬───────┘ └──────┬───────┘ │
│         └───────────────┴────────────────┘         │
│                       │ React Context + Hooks       │
│                       │                             │
├───────────────────────┼─────────────────────────────┤
│                       │ Next.js API Routes          │
│                       ▼                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ AI       │ │ Project  │ │ Auth     │           │
│  │ Generate │ │ CRUD     │ │ JWT      │           │
│  │ Validate │ │          │ │          │           │
│  │ Analyze  │ │          │ │          │           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│       │             │            │                  │
│       ▼             ▼            ▼                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ AI       │ │ Prisma   │ │ JWT      │           │
│  │ Client   │ │ ORM      │ │ Verify   │           │
│  └────┬─────┘ └────┬─────┘ └──────────┘           │
│       │             │                              │
│       ▼             ▼                              │
│  ┌──────────┐ ┌──────────┐                        │
│  │ OpenAI   │ │ SQLite   │                        │
│  │ API      │ │ Database │                        │
│  └──────────┘ └──────────┘                        │
│                                                     │
│              Server (Next.js)                       │
└─────────────────────────────────────────────────────┘


### 项目结构

```
Novel/
├── index.html
├── vite.config.js
├── eslint.config.js
├── package.json
│
├── 小说流程.md
├── 状态节点.md
├── 小说结构模型v2.0.md              # 规范 JSON Schema
├── 小说结构模型v2.1.md              # 运行时 JSON Schema
├── README.md
├── README.local.md
│
└── src/
    ├── main.jsx                       # 入口
    ├── App.jsx                        # 四视图壳（home / structure / content / settings）
    ├── store.jsx                      # Context + useReducer，节点/协同/持久化
    ├── data.js                        # 静态演示片段
    ├── index.css                      # 全局样式
    │
    ├── components/
    │   ├── ui.jsx                     # Badge / ProgressBar / Btn 等
    │   ├── Sidebar.jsx
    │   ├── Header.jsx
    │   │
    │   ├── home/
    │   │   ├── HomeView.jsx           # N-0 项目首页、导入导出
    │   │   └── NodeProgressPanel.jsx  # 七阶段节点进度总览
    │   │
    │   ├── structure/
    │   │   ├── StructureView.jsx      # 七阶段 Tab + NodeCard + StaleBanner
    │   │   ├── CharacterPanel.jsx     # N-1.1 角色库（内嵌 AI 工作流）
    │   │   ├── LocationPanel.jsx      # N-1.2 地点库（内嵌 AI 工作流）
    │   │   ├── MagicPanel.jsx         # N-1.3 力量体系（内嵌 AI 工作流）
    │   │   ├── TimelinePanel.jsx      # N-1.4 时间线（内嵌 AI 工作流）
    │   │   ├── ConstraintPanel.jsx    # N-1.5 约束规则（内嵌 AI 工作流）
    │   │   ├── NodeWorkflowPanel.jsx  # 六步 AI 完善流程（嵌入各 Panel）
    │   │   ├── ActPlotPanel.jsx       # N-2.1 / N-2.2 三幕与五线
    │   │   ├── ForeshadowPanel.jsx    # N-2.3 伏笔网
    │   │   ├── CollaborationPanel.jsx # N-3.1 作者 / 章节归属 / 交接
    │   │   ├── VolumePanel.jsx        # N-4.1 分册骨架
    │   │   ├── ChapterPanel.jsx       # N-4.2 逐章大纲
    │   │   ├── ForeshadowBoard.jsx    # N-6.1 伏笔看板
    │   │   ├── ConstraintScanPanel.jsx    # N-6.2 全场景约束扫描
    │   │   ├── CollaborationSyncPanel.jsx # N-6.3 协同同步日志
    │   │   └── FinalReport.jsx        # N-7.1～N-7.4 终审报告
    │   │
    │   ├── content/
    │   │   └── ContentView.jsx        # N-5.1 章节 + 场景 + 校验侧栏
    │   │
    │   └── settings/
    │       └── SettingsView.jsx       # AI 模型参数（待接 API）
    │
    └── lib/
        ├── index.js                   # 模块统一导出
        ├── project.js                 # 默认种子、归一化、导出
        ├── nodes.js                   # 阶段节点、依赖、回溯
        ├── node-progress.js           # 节点进度汇总
        ├── collaboration.js           # N-3.1 / N-6.3 协同数据
        ├── storage.js                 # localStorage + JSON 文件 IO
        ├── constraints-engine.js      # 场景 / 全项目约束校验
        ├── foreshadow-engine.js       # 伏笔状态机
        ├── progress-aggregator.js     # 进度与健康度
        ├── context-orchestrator.js    # 节点上下文裁剪 (≤8KB)
        ├── schema-validator.js        # 运行时 Schema 校验
        ├── ai-client.js               # OpenAI 兼容封装（UI 待接入）
        └── node-executor.js           # 六步节点循环（模拟）
```

**说明**：`PhaseTabs`、`NodeCard` 内嵌于 `StructureView.jsx`；`ContentView.jsx` 内嵌章节列表、场景 Tab、MetaPanel、校验列表。


### 数据库模型（目标全栈 · Prisma Schema）

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String
  name      String
  projects  Project[]
  createdAt DateTime  @default(now())
}

model Project {
  id          String    @id @default(cuid())
  title       String
  description String?
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  novelData   String    @default("{}")  // JSON: story_arcs + plot_lines + foreshadow_graph + ...
  settings    String    @default("{}")  // JSON: AI 模型配置
  chapters    Chapter[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Chapter {
  id        String  @id @default(cuid())
  projectId String
  project   Project @relation(fields: [projectId], references: [id])
  chapterId Int     // 1, 2, 3...
  title     String
  metadata  String  @default("{}")  // JSON: chapter_metadata
  scenes    Scene[]
  status    String  @default("locked")  // locked | draft | progress | done
  wordCount Int     @default(0)
  sortOrder Int     @default(0)
}

model Scene {
  id        String  @id @default(cuid())
  chapterId String
  chapter   Chapter @relation(fields: [chapterId], references: [id])
  sceneId   String  // ch1_s1, ch1_s2...
  pov       String
  setting   String
  content   String  @default("")
  metadata  String  @default("{}")  // JSON: conflict + beats + foreshadow + plot_lines_progress
  sortOrder Int     @default(0)
}


## 开发进度

### 节点实现一览

| 节点 | 功能 | 原型 | 说明 |
|------|------|------|------|
| N-0 | 项目首页 | ✅ | `HomeView`：进度、导入导出、节点总览 |
| N-1.1～N-1.5 | 世界观五库 | ✅ | 各 Panel 内嵌 AI 工作流 + CRUD + 回溯标记 |
| N-2.1～N-2.2 | 三幕 / 五线 | ✅ | `ActPlotPanel` 可编辑 |
| N-2.3 | 伏笔网 | ✅ | `ForeshadowPanel` |
| N-3.1 | 协同面板 | ✅ | `CollaborationPanel` 作者/章节归属/交接 CRUD |
| N-4.1～N-4.2 | 分册 / 逐章 | ✅ | `VolumePanel` `ChapterPanel` |
| N-5.1 | 场景写作 | ✅ | `ContentView` + 分册筛选章节 |
| N-6.1 | 伏笔看板 | ✅ | `ForeshadowBoard` |
| N-6.2 | 约束扫描 | ✅ | `ConstraintScanPanel` 全场景扫描 + 跳转 |
| N-6.3 | 协同同步 | ✅ | `CollaborationSyncPanel` 同步日志 CRUD + 冲突检测 |
| N-7.1～N-7.4 | 终审闭环 | ✅ | `FinalReport` 健康度 |

图例：✅ 可用 · 🔶 部分 · ⏭️ 跳过/Phase 2

### 六步循环（节点工作流）

| 步骤 | 原型状态 |
|------|----------|
| ① 上下文编排 | ✅ `context-orchestrator.js` |
| ② AI 生成 | 🔶 `ai-client` / `node-executor` 有库，UI 模拟 |
| ③ 自动校验 | ✅ 场景校验 + 全项目扫描 |
| ④ Web 展示 | ✅ 结构/内容视图 |
| ⑤ 人工确认 | ✅ 面板编辑 |
| ⑥ 锁定写入 | ✅ localStorage + **节点卡片「标记完成」** |

### 待开发（全栈 / 增强）

| 项 | 说明 |
|----|------|
| Next.js API + Prisma | 后端持久化与 AI 路由 |
| Tiptap / ECharts | 富文本与关系图可视化 |
| WebSocket 协同 | N-3.1 / N-6.3 完整实现 |
| AI 真实调用 | 设置页 API Key 接入生成流程 |


打包体积预估

模块	来源	gzip 体积
Next.js 运行时	next	~85 KB
React + ReactDOM	react/react-dom	~42 KB
Tiptap 编辑器	@tiptap/* + prosemirror	~65 KB
ECharts 图表	echarts	~200 KB
echarts-for-react	echarts-for-react	~2 KB
Lucide 图标 (按需)	lucide-react	~3 KB
Tailwind CSS (按需)	tailwindcss	~8 KB
总计		~405 KB
