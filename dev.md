# xizhilanre-blog 开发文档

## 环境要求

| 工具 | 最低版本 |
|---|---|
| Node.js | ≥ 18.0.0 |
| pnpm | ≥ 8.0.0 |
| MongoDB | ≥ 6.0（本地或 Atlas） |

## 快速开始

```bash
# 1. 安装依赖（根目录执行，自动安装所有 workspace）
pnpm install

# 2. 配置环境变量（编辑 .env）
# 必须填写：MONGODB_URI、OPENAI_API_KEY、JWT_SECRET

# 3. 启动开发服务器
pnpm dev          # Turborepo 并行启动 web + api
```

启动后：
- 前端：http://localhost:3000
- 后端：http://localhost:3001/api
  
  可用端点：
  - `GET /api` — API 基本信息
  - `GET /api/health` — 健康检查
  - `GET /api/users` — 用户模块（待实现）
  - `GET /api/articles` — 文章模块（待实现）
  - `GET /api/projects` — 作品模块（待实现）
  - `GET /api/auth` — 认证模块（待实现）
  - `GET /api/agent` — AI Agent 模块（待实现）

## 目录结构

```
xizhilanre-blog/
├── apps/
│   ├── web/                  # Next.js 14 前端（端口 3000）
│   │   ├── src/
│   │   │   ├── app/          # App Router 页面路由
│   │   │   ├── components/
│   │   │   │   └── ui/       # shadcn/ui 组件（npx shadcn add）
│   │   │   ├── hooks/        # 自定义 Hooks
│   │   │   ├── lib/          # 工具函数（cn、axios 实例等）
│   │   │   └── types/        # 本地类型定义
│   │   ├── components.json   # shadcn/ui 配置
│   │   ├── tailwind.config.ts
│   │   └── next.config.mjs
│   └── api/                  # NestJS 后端（端口 3001，全局前缀 /api）
│       ├── src/
│       │   ├── main.ts           # 入口：CORS + ValidationPipe + /api 前缀
│       │   ├── app.module.ts     # 根模块：ConfigModule + MongooseModule + 5 个子模块
│       │   ├── app.controller.ts # 根控制器（GET /api、GET /api/health）
│       │   └── modules/
│       │       ├── users/        # 用户模块（Schema + CRUD）
│       │       ├── articles/     # 文章模块（Schema + CRUD）
│       │       ├── projects/     # 作品模块（Schema + CRUD）
│       │       ├── auth/         # 认证模块（JWT + Passport）
│       │       └── agent/        # AI Agent 模块
│       ├── dist/             # 构建产物
│       └── nest-cli.json
├── packages/
│   ├── ui/                   # 共享组件库（shadcn/ui 基座）
│   ├── types/                # TypeScript 类型定义
│   └── ai-agent/             # DeepSeek AI 逻辑封装
├── .env                      # 环境变量（不提交 Git）
├── turbo.json                # Turborepo 任务管道
├── tsconfig.base.json        # 共享 TS 配置
└── pnpm-workspace.yaml       # pnpm workspace 声明
```

## 常用命令

### 全局命令（根目录执行）

```bash
pnpm dev            # 并行启动 web + api 开发服务器
pnpm build          # 构建所有包（先构建依赖包，再构建应用）
pnpm lint           # 对所有包执行 ESLint
pnpm format         # Prettier 格式化全部代码
pnpm format:check   # 检查格式是否合规
```

### 单独操作某个包

```bash
# 前端
pnpm --filter @xizhilanre/web dev        # 启动 Next.js 开发服务器
pnpm --filter @xizhilanre/web build      # 构建前端

# 后端
pnpm --filter @xizhilanre/api dev        # 启动 NestJS 开发服务器（watch 模式）
pnpm --filter @xizhilanre/api build      # 编译后端到 dist/

# 添加依赖到指定包
pnpm --filter @xizhilanre/web add <package>
pnpm --filter @xizhilanre/api add -D <dev-package>
```

### Turbo 命令

```bash
turbo build --force   # 强制重新构建（忽略缓存）
turbo dev --filter=@xizhilanre/web  # 只启动 web 开发服务器
```

## 开发工作流

### 添加新页面（web）

1. 在 `apps/web/src/app/` 下创建路由文件夹（如 `apps/web/src/app/articles/`）
2. 创建 `page.tsx`、`layout.tsx`（可选）、`loading.tsx`（可选）
3. 前端组件必须包含 **加载状态** 和 **错误状态**

```
src/app/
├── layout.tsx        # 根布局
├── page.tsx          # 首页 /
├── articles/
│   ├── page.tsx      # /articles
│   └── [id]/
│       └── page.tsx  # /articles/:id
└── projects/
    └── page.tsx      # /projects
```

### 添加 API 模块（api）

1. 使用 NestJS CLI 生成模块：

```bash
pnpm --filter @xizhilanre/api exec nest g module articles
pnpm --filter @xizhilanre/api exec nest g controller articles
pnpm --filter @xizhilanre/api exec nest g service articles
```

2. 响应格式统一为：

```ts
// 成功
{ success: true, data: { ... }, message: "操作成功" }

// 失败
{ success: false, error: "错误描述", code: 400 }
```

3. 分页接口使用 `?page=1&limit=10` 参数

### 添加共享类型（types）

1. 在 `packages/types/src/index.ts` 中添加新接口
2. 其他包直接 `import { IYourType } from '@xizhilanre/types'`

### 添加共享组件（ui）

1. 在 `packages/ui/src/` 创建组件文件（PascalCase 命名：`Button.tsx`）
2. 导出到 `packages/ui/src/index.ts`
3. 前端中使用：`import { Button } from '@xizhilanre/ui'`

### 添加 shadcn/ui 组件

```bash
# 在 apps/web 目录下执行（注意：shadcn-ui 已废弃，必须用 shadcn）
cd apps/web && npx shadcn@latest add <组件名>

# 示例
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
```

组件生成路径：`src/components/ui/<组件名>.tsx`

shadcn/ui 当前配置：
- 风格：New York
- 色系：Zinc
- 支持暗色模式（class 策略）
- RSC（React Server Components）模式

### AI Agent 集成

```ts
import { chat, summarize, createAIClient } from '@xizhilanre/ai-agent';

// 聊天
const reply = await chat([
  { role: 'user', content: '你好' }
]);

// 生成摘要
const summary = await summarize(articleContent);

// 自定义客户端
const client = createAIClient();
```

## 环境变量

| 变量 | 说明 | 必填 |
|---|---|---|
| `MONGODB_URI` | MongoDB 连接字符串 | 是 |
| `OPENAI_API_KEY` | DeepSeek API Key | 是 |
| `OPENAI_API_BASE` | API Base URL（默认 `https://api.deepseek.com/v1`） | 否 |
| `JWT_SECRET` | JWT 签名密钥（≥32 字符） | 是 |
| `NODE_ENV` | 运行环境（`development` / `production`） | 否 |

## Turborepo 任务管道

```
build:  ^build → build  （先构建依赖包，再构建自身）
dev:    无缓存，持久运行
lint:   ^build → lint
test:   build → test
```

- `@xizhilanre/web` 的 build 依赖 `@xizhilanre/ui` 和 `@xizhilanre/types` 先构建
- `@xizhilanre/api` 的 build 依赖 `@xizhilanre/types` 先构建

## 编码规范

1. **TypeScript 严格模式** — 禁止 `any` 类型
2. **命名**：组件 PascalCase，函数 camelCase，常量 UPPER_SNAKE_CASE，API 路由 kebab-case
3. **注释**：全部使用中文
4. **安全**：密钥一律从 `process.env` 读取，API 输入必须验证
5. **格式化**：提交前执行 `pnpm format` ，在 `apps/api` 中运行 `pnpm lint` 检查修复语法

### ConfigModule 坑点（重要）

- `ConfigModule.forRoot({ isGlobal: true })` 已在 AppModule 设置，**不要在子模块的异步工厂中再次 `imports: [ConfigModule]`**，否则会创建无 .env 绑定的独立实例，导致 `getOrThrow` 报 key 不存在。
- 只需 `inject: [ConfigService]` 即可，全局 ConfigService 自动可用。
- `.env` 文件路径：编译后 `__dirname` = `apps/api/dist/`，到根目录 `.env` 需 `path.resolve(__dirname, '../../../.env')`（三层 `../`，不是两层）。

### pnpm 命令不可用

```bash
npm install -g pnpm
```

### 端口被占用

```bash
# Windows 查看端口占用
netstat -ano | findstr :3000
# 修改 apps/api/src/main.ts 中的端口号
```

### 构建报错 "Cannot find module @xizhilanre/types"

先执行 `pnpm build` 全局构建一次，确保 workspace 依赖已编译。

### Next.js 热更新不生效

删除 `.next` 目录后重新启动：

```bash
rm -rf apps/web/.next && pnpm --filter @xizhilanre/web dev
```

### NestJS 启动报 Mongo 连接错误

检查 `.env` 中 `MONGODB_URI` 是否正确，或临时注释掉 AppModule 中的 `MongooseModule.forRootAsync`。

### 访问 / 返回 404

API 使用了全局前缀 `/api`，请访问 `http://localhost:3001/api` 而非根路径。

### pnpm --filter 报错

确认当前终端在项目根目录（`xizhilanre-blog/` 而非其父目录），否则 workspace 包无法识别。
