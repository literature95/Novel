# Novel - AI 辅助小说写作平台

## 📖 项目简介

Novel 是一个集 **AI 辅助写作**、**小说管理**、**角色设计**、**世界观构建**于一体的全功能小说创作平台。通过先进的 AI 技术，帮助作家快速生成灵感、完善剧情、管理故事世界。

## ✨ 核心功能

### 📝 写作工具
- **沉浸式编辑器**：支持 Markdown 语法，实时预览效果
- **自动保存**：编辑内容自动保存，防止意外丢失
- **AI 章节生成**：基于章节简介智能生成内容草稿
- **格式快捷工具栏**：提供粗体、斜体、标题、列表等常用格式

### 📚 小说管理
- **章节管理**：创建、编辑、删除、排序章节
- **小说统计**：实时显示章节数、字数、段落数等信息
- **内容导出**：支持将小说导出为多种格式
- **版本控制**：记录创作历史，支持版本回滚

### 🎭 角色设计
- **角色档案**：创建详细的角色信息卡片
- **关系图谱**：可视化展示角色之间的关系网络
- **角色发展**：追踪角色在故事中的成长轨迹
- **AI 角色建议**：基于角色设定生成发展建议

### 🌍 世界观构建
- **世界设定**：记录小说世界的规则、历史、地理等
- **时间线**：可视化展示故事的时间脉络
- **地点管理**：创建和管理故事中的重要地点
- **AI 世界扩展**：基于现有设定智能扩展世界观

### 🔧 管理功能
- **用户认证**：支持注册、登录、权限管理
- **管理员后台**：管理用户、小说、系统配置
- **数据备份**：定期备份用户数据
- **系统监控**：实时监控系统状态

## 🛠 技术栈

### 前端
框架：Next.js 16 (App Router)
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
novel/
├── .env.local                        ← 环境变量 (API Key / DB URL / JWT Secret)
├── next.config.js                    ← Next.js 配置
├── package.json
├── tsconfig.json
├── prisma/
│   ├── schema.prisma                 ← 数据库模型定义
│   ├── migrations/                   ← 迁移文件
│   └── seed.ts                       ← 种子数据 (示例项目)
│
└── src/
    ├── app/
    │   ├── layout.tsx                ← 根布局 (字体加载 / 主题)
    │   ├── page.tsx                  ← 首页
    │   │
    │   ├── (dashboard)/              ← 路由组 (共享侧边栏布局)
    │   │   ├── layout.tsx            ← Dashboard 布局 (Sidebar + Header)
    │   │   ├── structure/
    │   │   │   └── page.tsx          ← 小说结构生成视图
    │   │   ├── content/
    │   │   │   └── page.tsx          ← 小说内容创作视图
    │   │   └── settings/
    │   │       └── page.tsx          ← AI 模型设置视图
    │   │
    │   └── api/
    │       ├── ai/
    │       │   ├── generate/route.ts ← AI 生成接口 (场景/结构/大纲)
    │       │   ├── validate/route.ts ← 约束校验接口
    │       │   └── analyze/route.ts  ← 节奏分析/伏笔分析接口
    │       ├── project/
    │       │   ├── route.ts          ← 项目 CRUD
    │       │   └── [id]/route.ts     ← 单项目操作
    │       ├── chapter/
    │       │   └── route.ts          ← 章节 CRUD
    │       ├── scene/
    │       │   └── route.ts          ← 场景 CRUD
    │       └── auth/
    │           ├── login/route.ts    ← 登录
    │           └── register/route.ts ← 注册
    │
    ├── components/
    │   ├── ui.tsx                    ← 基础组件 (Badge / ProgressBar / Btn / Card / Dot)
    │   ├── Sidebar.tsx
    │   ├── Header.tsx
    │   │
    │   ├── structure/
    │   │   ├── StructureView.tsx
    │   │   ├── PhaseTabs.tsx
    │   │   ├── NodeCard.tsx
    │   │   ├── CharacterGrid.tsx
    │   │   ├── ConstraintList.tsx
    │   │   ├── ForeshadowGraph.tsx        ← ECharts Graph (力导向图)
    │   │   ├── CharacterRelationGraph.tsx  ← ECharts Graph (复用)
    │   │   ├── PlotLineCanvas.tsx          ← Canvas 五线进度
    │   │   ├── ActStructureChart.tsx       ← ECharts 三幕节奏图
    │   │   ├── EmotionCurveChart.tsx       ← ECharts 情绪折线图
    │   │   └── ChapterOutline.tsx
    │   │
    │   ├── content/
    │   │   ├── ContentView.tsx
    │   │   ├── ChapterList.tsx
    │   │   ├── SceneEditor.tsx            ← Tiptap EditorContent
    │   │   ├── SceneTabs.tsx
    │   │   ├── MetaPanel.tsx
    │   │   ├── ConflictBar.tsx
    │   │   ├── BeatsList.tsx
    │   │   ├── ForeshadowTag.tsx
    │   │   └── ValidationPanel.tsx
    │   │
    │   └── settings/
    │       ├── SettingsView.tsx
    │       ├── ModelConfig.tsx
    │       ├── GenerationParams.tsx
    │       ├── StyleConfig.tsx
    │       └── SchemaBinding.tsx
    │
    ├── lib/
    │   ├── db.ts                        ← Prisma Client 单例
    │   ├── auth.ts                      ← JWT 签发 / 验证 / 中间件
    │   ├── ai-client.ts                 ← OpenAI 兼容接口统一封装
    │   ├── context-orchestrator.ts      ← 上下文编排器 (智能裁剪)
    │   ├── foreshadow-engine.ts         ← 伏笔状态机逻辑
    │   ├── constraints-engine.ts        ← 约束规则执行
    │   ├── progress-aggregator.ts       ← 进度自动计算
    │   └── schema-validator.ts          ← JSON Schema 校验
    │
    ├── hooks/
    │   ├── useAI.ts                     ← AI API 调用 (React Hook)
    │   ├── useValidation.ts             ← 前端校验逻辑
    │   ├── useProject.ts                ← 项目数据 CRUD
    │   └── useLocalStorage.ts           ← 本地持久化
    │
    ├── store/
    │   ├── NovelProvider.tsx            ← 全局状态 Context Provider
    │   └── types.ts                     ← 状态类型定义
    │
    ├── types/
    │   ├── novel.ts                     ← 小说数据结构类型
    │   ├── schema.ts                    ← JSON Schema 类型
    │   └── api.ts                       ← API 请求/响应类型
    │
    └── styles/
        └── fonts.ts                     ← 字体加载配置
### 数据库模型 (Prisma Schema)

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
