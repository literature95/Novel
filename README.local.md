# Novel — AI 辅助小说写作平台

基于 **雪花叙事架构 v2.0** 的小说创作工作台：从世界观与规则构建，到场景写作、实时校验与终审交付，覆盖完整 7 阶段创作管线。

> **当前阶段**：Vite + React 本地原型（`localStorage` 持久化）。本文档为**与代码一致**的说明；公开 [`README.md`](./README.md) 含目标全栈架构描述。

---

## 快速开始

```bash
npm install
npm run dev      # 开发：http://localhost:5173
npm run build    # 生产构建 → dist/
npm run lint     # ESLint
npm run preview  # 预览构建产物
```

数据保存在浏览器 `localStorage`（键 `snowflake-novel-project`），支持 JSON 导入/导出完整项目。

---

## 四大视图

| 视图 | 入口 | 作用 |
|------|------|------|
| **项目首页** | 侧边栏 · 首页 | 进度总览、项目信息、导入/导出 |
| **小说结构生成** | 侧边栏 · 结构 | 7 阶段节点、各阶段面板、回溯提醒 |
| **小说内容创作** | 侧边栏 · 内容 | 章节列表、场景编辑、约束校验 |
| **AI 模型设置** | 侧边栏 · 设置 | API Key、模型参数、写作风格（配置 UI，AI 调用待接入） |

---

## 七阶段创作管线

与 [`小说流程.md`](./小说流程.md) 一致；节点依赖与状态机详见 [`状态节点.md`](./状态节点.md)。

| 阶段 | 节点 | 规范模块 (v2.0) | 运行时字段 | 结构视图 |
|------|------|-----------------|------------|----------|
| 一 | N-1.1～N-1.5 | `knowledge_graph` + `constraints_engine` | `characters` `locations` `magicSystem` `timeline` `constraints` | 各 Panel |
| 二 | N-2.1～N-2.3 | `story_arcs` + `plot_lines` + `foreshadow_graph` | `acts` `plotLines` `foreshadows` | Phase2 + `ForeshadowPanel` |
| 三 | N-3.1 | `collaboration_board` | — | 占位（默认 `skip`） |
| 四 | N-4.1～N-4.2 | `volumes` + `chapter_metadata` | `volumes` `chapters` | `VolumePanel` `ChapterPanel` |
| 五 | N-5.1 | `scenes` + 元数据更新 | `scenes` | → `ContentView` |
| 六 | N-6.1～N-6.3 | 引擎 + 伏笔图 | `foreshadows` + 校验 | `ForeshadowBoard` + 内容校验 |
| 七 | N-7.1～N-7.4 | 全模型终审 | `FinalReport` | `FinalReport` |

每个节点遵循六步循环：加载上下文 → AI 生成 → 自动校验 → Web 展示 → 人工确认 → 锁定写入（见 `状态节点.md`）。

---

## 数据模型

| 文档 | 角色 |
|------|------|
| [`小说结构模型v2.0.md`](./小说结构模型v2.0.md) | **规范** JSON Schema（嵌套雪花模块） |
| [`小说结构模型v2.1.md`](./小说结构模型v2.1.md) | **运行时** Schema（`project.js` 扁平字段） |

v2.0 ↔ v2.1 映射表见 v2.0 文档 § v2.0 ↔ 运行时。

---

## 已实现功能（原型）

| 能力 | 实现位置 |
|------|----------|
| 7 阶段节点图 | `lib/nodes.js`：`dependsOn`、状态 `blocked`/`unlocked`/`progress`/`completed`/`skip`、回溯 `stale_*` |
| 角色 / 地点 / 力量 / 时间线 / 约束 | `components/structure/*Panel.jsx` |
| 三幕 + 五线 + 伏笔网 | `StructureView` Phase2、`ForeshadowPanel` |
| 分册 + 逐章大纲 | `VolumePanel`、`ChapterPanel` |
| 场景写作 + 校验 | `ContentView`、`lib/constraints-engine.js` |
| 伏笔看板 + 终审报告 | `ForeshadowBoard`、`FinalReport`、`lib/foreshadow-engine.js` |
| 进度与健康度 | `lib/progress-aggregator.js` |
| 上下文编排（≤8KB） | `lib/context-orchestrator.js` |
| Schema 校验 | `lib/schema-validator.js` |
| 本地持久化 | `lib/storage.js`、JSON 导入导出 |
| 节点工作流 UI | 各阶段节点卡片「标记完成」、首页节点进度总览 |
| 全场景约束扫描 | `validateAllScenes` + `ConstraintScanPanel` |
| 三幕/五线编辑 | `ActPlotPanel` |
| 协同 N-3.1 / N-6.3 | `CollaborationPanel` + `CollaborationSyncPanel` 完整 CRUD |
| 示例项目 | 《雾隐镇》种子，`lib/project.js` |

**试用**：结构视图 → 将「林渊」设为 **死亡** → 内容视图 → 点校验 → R-001 生效。

---

## 规划中（目标架构）

尚未在本仓库落地：

- **后端**：Next.js API Routes、Prisma + SQLite/PostgreSQL、JWT
- **AI 全流程**：`ai-client` + `node-executor` 与 UI 打通
- **编辑器**：Tiptap 富文本、Beats 结构化编辑
- **可视化**：ECharts 伏笔网/关系图、Canvas 五线进度
- **协同**：`collaboration_board`、WebSocket + Yjs（Phase 2）

静态交互原型可参考 [`code.html`](./code.html)（若存在）。

---

## 技术栈（当前）

| 类别 | 选型 |
|------|------|
| 构建 | Vite 8 |
| 框架 | React 19 |
| 样式 | Tailwind CSS 4 |
| 状态 | React Context + `useReducer`（`store.jsx`） |
| 图标 | Lucide React |
| 持久化 | `localStorage` + JSON 文件 |

---

## 项目结构

```
Novel/
├── index.html
├── vite.config.js
├── package.json
│
├── 小说流程.md              # 七阶段 ↔ 模块 ↔ 视图
├── 状态节点.md              # 节点拓扑、状态机、组件映射
├── 小说结构模型v2.0.md      # 规范 JSON Schema + 映射表
├── 小说结构模型v2.1.md      # 运行时 JSON Schema
├── README.local.md          # 本文档（与代码对齐）
├── README.md                # 产品愿景与目标架构
│
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── store.jsx
    ├── data.js
    ├── index.css
    │
    ├── components/
    │   ├── Sidebar.jsx
    │   ├── Header.jsx
    │   ├── ui.jsx
    │   ├── home/
    │   │   ├── HomeView.jsx
    │   │   └── NodeProgressPanel.jsx
    │   ├── structure/
    │   │   ├── StructureView.jsx      # PhaseTabs + NodeCard 内嵌
    │   │   ├── CharacterPanel.jsx
    │   │   ├── LocationPanel.jsx
    │   │   ├── MagicPanel.jsx
    │   │   ├── TimelinePanel.jsx
    │   │   ├── ConstraintPanel.jsx
    │   │   ├── ActPlotPanel.jsx
    │   │   ├── ForeshadowPanel.jsx
    │   │   ├── CollaborationPanel.jsx
    │   │   ├── VolumePanel.jsx
    │   │   ├── ChapterPanel.jsx
    │   │   ├── ForeshadowBoard.jsx
    │   │   ├── ConstraintScanPanel.jsx
    │   │   ├── CollaborationSyncPanel.jsx
    │   │   └── FinalReport.jsx
    │   ├── content/
    │   │   └── ContentView.jsx
    │   └── settings/
    │       └── SettingsView.jsx
    │
    └── lib/
        ├── index.js
        ├── project.js
        ├── nodes.js
        ├── node-progress.js
        ├── collaboration.js
        ├── storage.js
        ├── constraints-engine.js
        ├── foreshadow-engine.js
        ├── progress-aggregator.js
        ├── context-orchestrator.js
        ├── schema-validator.js
        ├── ai-client.js
        └── node-executor.js
```

---

## 架构示意（当前）

```
┌─────────────────────────────────────────────┐
│  Sidebar  │  Header                          │
│  首页     ├──────────────────────────────────┤
│  结构     │  StructureView                   │
│  内容     │    PhaseTabs → NodeCard → Panels │
│  设置     ├──────────────────────────────────┤
│           │  ContentView / HomeView / Settings│
├───────────┴──────────────────────────────────┤
│  store.jsx → lib/project · nodes · engines   │
│       ↓                                      │
│  localStorage / JSON 文件                    │
└─────────────────────────────────────────────┘
```

**目标（全栈）**：浏览器 → Next.js API → Prisma + OpenAI 兼容 API — 见 `README.md`。

---

## 相关文档

| 文档 | 内容 |
|------|------|
| [`小说流程.md`](./小说流程.md) | 阶段、模块、视图、六步循环 |
| [`状态节点.md`](./状态节点.md) | 节点拓扑、状态机、数据流、组件表 |
| [`小说结构模型v2.0.md`](./小说结构模型v2.0.md) | 规范 Schema 与 v2.1 映射 |
| [`小说结构模型v2.1.md`](./小说结构模型v2.1.md) | 运行时 Schema |

---

## 许可证

私有项目（`package.json` → `"private": true`）。
