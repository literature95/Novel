# CLAUDE.md - Novel 小说创作平台

## 项目概述
Novel 是一个基于 **Snowflake Novel Architecture v2.0（雪花叙事架构）** 的全功能小说创作平台，提供 7 阶段创作管线：世界观构建 → 全局叙事规划 → 协同任务分配 → 分册章节蓝图 → 场景迭代写作 → 实时校验 → 修订交付。

## 技术栈

### 前端
- **框架**: React 19 + TypeScript
- **构建工具**: Vite
- **UI 库**: Tailwind CSS 4
- **状态管理**: React Context + useReducer
- **富文本编辑器**: Tiptap 3.x (ProseMirror)
- **数据可视化**: ECharts 5.x
- **图标**: Lucide React
- **字体**: Noto Serif SC + Playfair Display + DM Mono

### 后端
- **框架**: Python FastAPI
- **数据库**: SQLite (个人创作) / PostgreSQL (团队协作)
- **ORM**: 原生 sqlite3 (轻量) / SQLAlchemy (可选)
- **认证**: JWT (jose)
- **文件存储**: 本地文件系统

### AI 服务
- **接口**: OpenAI 兼容接口 (Chat Completions API)
- **支持模型**: GPT-4o / Claude 3.5 Sonnet / DeepSeek-R1 / Qwen-Max / Gemini 2.5 Pro
- **上下文管理**: Context Orchestrator (智能裁剪，单次请求 ≤ 8KB)
- **HTTP 客户端**: httpx

## 项目结构
```
novel-platform/
├── frontend/                 # React 前端
│   ├── src/
│   │   ├── components/      # 组件
│   │   ├── pages/          # 页面
│   │   ├── contexts/       # React Context
│   │   ├── services/       # API 服务
│   │   └── utils/          # 工具函数
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── backend/                 # FastAPI 后端
│   ├── app/
│   │   ├── api/            # 路由
│   │   ├── core/           # 核心配置
│   │   ├── models/         # 数据模型
│   │   ├── schemas/        # Pydantic 模型
│   │   ├── services/       # 业务逻辑
│   │   └── utils/          # 工具函数
│   ├── database/
│   │   └── schema.sql      # 数据库建表语句
│   ├── requirements.txt
│   └── main.py
├── ai-service/             # AI 服务层
│   ├── context_orchestrator.py  # 上下文编排
│   ├── scene_generator.py       # 场景生成
│   ├── validator.py             # 校验引擎
│   └── config.py                # AI 配置
└── docs/                   # 文档
    ├── api/               # API 文档
    └── architecture/      # 架构设计
```

## 数据模型 (12 张表)

### 核心表
1. **projects** - 小说项目
2. **characters** - 角色（含 arc_progress、status、traits JSON）
3. **locations** - 地点（含 type、era、atmosphere）
4. **power_systems** - 力量体系（含 rules、costs、sources）
5. **timeline_events** - 时间线事件
6. **constraint_rules** - 约束规则（type: absolute|soft|guideline）

### 叙事结构表
7. **plot_lines** - 五条叙事线（含 milestones JSON）
8. **foreshadows** - 伏笔（状态机：drafted → planted → reinforced → partially_revealed → resolved）
9. **volumes** - 分册
10. **chapters** - 章节（含 POV、momentum、emotion_peak）
11. **scenes** - 场景（含 beats JSON、conflict_type、五维进度）
12. **scene_validations** - 校验记录

## 7 阶段创作管线 API 端点

### 阶段一：世界观构建
- `POST /api/v1/characters` - 创建角色
- `GET /api/v1/characters/{id}` - 获取角色详情
- `PUT /api/v1/characters/{id}` - 更新角色
- `DELETE /api/v1/characters/{id}` - 删除角色
- 类似端点：`/locations`, `/power-systems`, `/timeline-events`, `/constraint-rules`

### 阶段二：全局叙事规划
- `POST /api/v1/projects/{id}/plot-lines` - 创建叙事线
- `POST /api/v1/projects/{id}/foreshadows` - 创建伏笔
- `PUT /api/v1/foreshadows/{id}/status` - 更新伏笔状态

### 阶段三：协同任务分配
- `POST /api/v1/collaborations` - 创建协作任务
- `GET /api/v1/projects/{id}/collaborations` - 获取协作列表

### 阶段四：分册章节蓝图
- `POST /api/v1/projects/{id}/volumes` - 创建分册
- `POST /api/v1/volumes/{id}/chapters` - 创建章节
- `PUT /api/v1/chapters/{id}/blueprint` - 更新章节大纲

### 阶段五：场景迭代写作
- `POST /api/v1/chapters/{id}/scenes` - 创建场景
- `POST /api/v1/scenes/{id}/generate` - AI 生成场景内容
- `POST /api/v1/scenes/{id}/validate` - 校验场景

### 阶段六：实时校验
- `GET /api/v1/projects/{id}/foreshadow-board` - 伏笔看板
- `GET /api/v1/projects/{id}/constraint-scans` - 约束扫描

### 阶段七：修订交付
- `POST /api/v1/projects/{id}/final-review` - 终审报告
- `GET /api/v1/projects/{id}/export` - 导出项目（JSON）

## AI 上下文编排策略

### 上下文裁剪规则
1. **角色**：POV 角色全量，其他角色摘要（名称+关键特征）
2. **伏笔**：按重要度分级，只注入活跃且高优先级的伏笔
3. **世界观**：当前场景相关的地点/力量体系规则
4. **前场景**：只保留最近 3 个场景的摘要

### 场景生成 Prompt 模板
```
你是一个专业的小说创作助手，基于以下上下文生成一个场景：

## 角色档案
{character_profiles}

## 活跃伏笔
{active_foreshadows}

## 前情摘要
{previous_scene_summary}

## 世界观约束
{world_constraints}

## 场景要求
- POV 角色：{pov_character}
- 地点：{location}
- 冲突类型：{conflict_type}（强度：{intensity}/10）
- 目标字数：{target_words}
- 叙事节拍：4-6 个

请以 JSON 格式返回，包含以下字段：
{
  "title": "场景标题",
  "content": "场景正文（Markdown 格式）",
  "beats": ["节拍1", "节拍2", ...],
  "conflict_intensity": 强度评分,
  "new_foreshadows": [{"title": "伏笔标题", "deadline": "章节号"}],
  "progress_impact": {"plot": 0.1, "character": 0.05, ...}
}
```

## 校验规则引擎

### 六项自动校验
1. **POV 角色存活** - 检查 POV 角色 status = 'alive'
2. **地点存在** - 检查 location_id 在 locations 表中
3. **冲突类型声明** - 检查 conflict_type 不为空
4. **五线进度单调** - 检查 progress_impact 各维度 ≥ 0
5. **伏笔状态合法** - 检查涉及的伏笔状态转换符合状态机
6. **新伏笔 deadline** - 检查新伏笔的 deadline 在有效章节范围内

### 约束扫描
- **绝对规则**：违反则阻止保存
- **软规则**：违反则警告
- **指南**：仅作建议

## 开发环境设置

### 前端
```bash
cd frontend
npm install
npm run dev
```

### 后端
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 数据库初始化
```bash
cd backend
python init_db.py
```

## 部署配置

### 开发环境
- 前端：`http://localhost:5173`
- 后端：`http://localhost:8000`
- 数据库：`./data/novel_dev.db`

### 生产环境
- 前端：Vercel / Netlify
- 后端：Docker + Nginx
- 数据库：PostgreSQL (RDS / Supabase)

## 测试策略

### 单元测试
- 后端：pytest
- 前端：Vitest + React Testing Library

### 集成测试
- API 测试：httpx + pytest
- AI 服务测试：Mock OpenAI 响应

### E2E 测试
- Playwright / Cypress

## 性能优化

### 前端
- 代码分割：React.lazy + Suspense
- 图片懒加载
- 虚拟滚动长列表

### 后端
- SQLite WAL 模式
- 查询缓存（Redis 可选）
- 分页查询

### AI 服务
- 上下文缓存
- 批量请求合并
- 失败重试机制

## 安全考虑

1. **API 认证**：JWT + 刷新令牌
2. **输入验证**：Pydantic 模型验证
3. **SQL 注入防护**：参数化查询
4. **文件上传**：文件类型检查 + 大小限制
5. **AI API Key**：环境变量存储 + 后端代理

## 扩展计划

### Phase 1 (MVP)
- 单人创作全流程
- 基础 AI 场景生成
- 本地存储

### Phase 2
- 团队协作（Yjs + WebSocket）
- 版本控制
- 模板市场

### Phase 3
- 移动端应用
- 语音输入
- 多语言支持

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证
MIT License