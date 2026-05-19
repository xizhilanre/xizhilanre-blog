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
  - `POST /api/auth/register` — 注册
  - `POST /api/auth/login` — 登录
  - `GET /api/auth/profile` — 当前用户信息（需 JWT）
  - `GET /api/articles` — 文章列表（分页 + 标签筛选 + 搜索）
  - `GET /api/articles/:id` — 文章详情（自动 +1 viewCount）
  - `POST /api/articles` — 创建文章（需 JWT）
  - `PUT /api/articles/:id` — 更新文章（需 JWT，仅作者）
  - `DELETE /api/articles/:id` — 删除文章（需 JWT，仅作者）
  - `POST /api/articles/:id/like` — 点赞
  - `GET /api/projects` — 作品列表（支持 ?tech= 筛选）
  - `GET /api/projects/:id` — 作品详情
  - `POST /api/projects` — 创建作品（需 JWT）
  - `PUT /api/projects/:id` — 更新作品（需 JWT）
  - `DELETE /api/projects/:id` — 删除作品（需 JWT）
  - `GET /api/users/:id` — 公开个人信息
  - `PUT /api/users/profile` — 修改个人信息（需 JWT）
  - `POST /api/users/favorites/:articleId` — 收藏文章（需 JWT）
  - `DELETE /api/users/favorites/:articleId` — 取消收藏（需 JWT）
  - `GET /api/agent` — AI Agent 模块（待实现）

### 前端页面路由

| 路由 | 页面 | 状态 |
|---|---|---|
| `/` | 首页（Hero + 精选文章 + 最新文章无限滚动 + 精选项目展示） | 已完成 |
| `/articles` | 文章列表（标签筛选 + 搜索 + 分页 + Bento Grid） | 已完成 |
| `/articles/[id]` | 文章详情（Markdown 渲染 + TOC + 点赞 + AI 摘要骨架） | 已完成 |
| `/projects` | 作品集（技术栈筛选 + 卡片网格 + macOS 风格 Modal） | 已完成 |
| `/about` | 关于我（技能图谱 + 时间轴 + 简历内嵌展示） | 已完成 |
| `/login` | 登录页（毛玻璃表单 + JWT 存储） | 已完成 |

## 前端设计系统

**设计语言：Apple-esque Minimalist（苹果简约风）**

### 配色方案

深灰底色 + 白色卡片 + 蓝紫色强调色：

| 变量 | 值 | 用途 |
|---|---|---|
| `--background` | `hsl(220 13% 8%)` | 页面底色 |
| `--card` | `hsl(220 13% 12%)` | 卡片背景 |
| `--primary` | `hsl(255 65% 65%)` | 强调色（蓝紫） |
| `--muted-foreground` | `hsl(220 8% 55%)` | 次要文字 |
| `--border` | `hsl(220 13% 18%)` | 边框 |

### Typography

- 标题：`Playfair Display`（衬线，优雅）— 用于 h1-h4
- 正文：`Inter`（无衬线，科技感）— 用于 body 和 UI 元素
- 字号层级：3xl–4xl（Hero 大标题）/ xl–2xl（区块标题）/ sm–base（正文）

### 玻璃拟态

```css
.glass       → backdrop-blur-xl bg-background/60   （导航栏）
.glass-card  → backdrop-blur-md bg-card/80          （卡片）
```

所有卡片 hover 效果：`-translate-y-1 scale-[1.02]` + 阴影加深

### 动效规范

- 基础过渡：`transition-all duration-300 ease-in-out`
- 入场动画：`animate-fade-in`（opacity + translateY）
- 导航栏：滚动后触发 `glass` 效果（`backdrop-blur-xl`）
- 项目卡片：hover 触发微光效果（gradient overlay opacity 过渡）
- 骨架屏：`animate-pulse` + `animate-shimmer`

### 响应式断点

- 移动端（默认）：1 列，汉堡菜单抽屉
- 平板（`sm:` 640px）：2 列网格，导航展开
- 桌面（`lg:` 1024px）：3 列网格，TOC 侧边栏可见

### 技术部件

| 组件 | 库 | 位置 |
|---|---|---|
| Markdown 渲染 | react-markdown + remark-gfm | `apps/web/src/app/articles/[id]/page.tsx` |
| 代码高亮 | rehype-highlight (github-dark 主题) | `apps/web/src/app/globals.css` |
| 图标 | lucide-react | 全局使用 |
| 动画 | framer-motion + tailwindcss-animate | tailwind.config.ts |
| 数据请求 | SWR + axios | `apps/web/src/lib/api.ts` |

## 目录结构

```
xizhilanre-blog/
├── apps/
│   ├── web/                  # Next.js 14 前端（端口 3000）
│   │   ├── src/
│   │   │   ├── app/          # App Router 页面路由
│   │   │   │   ├── globals.css       # 全局样式 + CSS 变量 + 玻璃拟态 + highlight.js
│   │   │   │   ├── layout.tsx        # 根布局（Navbar + Footer）
│   │   │   │   ├── page.tsx          # 首页（Hero + 文章卡片 + 无限滚动）
│   │   │   │   ├── about/page.tsx    # 关于我（技能+时间轴+简历浮层）
│   │   │   │   ├── articles/
│   │   │   │   │   ├── page.tsx      # 文章列表（搜索+标签胶囊+分页+TOC）
│   │   │   │   │   └── [id]/page.tsx # 文章详情（Markdown+点赞+AI摘要骨架）
│   │   │   │   ├── login/page.tsx    # 登录页（毛玻璃表单）
│   │   │   │   └── projects/page.tsx # 作品集（筛选+卡片+macOS Modal）
│   │   │   ├── components/
│   │   │   │   ├── ui/               # shadcn/ui 组件（button 等）
│   │   │   │   ├── layout/           # 布局（Navbar 毛玻璃导航 + Footer）
│   │   │   │   ├── home/             # 首页（Hero + ArticleCard）
│   │   │   │   └── articles/         # 文章（TOC 目录导航）
│   │   │   ├── hooks/        # 自定义 Hooks
│   │   │   ├── lib/          # 工具函数
│   │   │   │   ├── api.ts            # 封装所有 API 请求（auth/articles/projects/users）
│   │   │   │   └── utils.ts          # cn() classnames 合并
│   │   │   └── types/        # 页面级类型定义
│   │   ├── components.json   # shadcn/ui 配置
│   │   ├── tailwind.config.ts
│   │   └── next.config.mjs
│   └── api/                  # NestJS 后端（端口 3001，全局前缀 /api）
│       ├── src/
│       │   ├── main.ts           # 入口：CORS + ValidationPipe + /api 前缀
│       │   ├── app.module.ts     # 根模块：ConfigModule + MongooseModule + 5 个子模块
│       │   ├── app.controller.ts # 根控制器（GET /api、GET /api/health）
│       │   ├── common/           # 公共模块（JWT 策略 + Guard）
│       │   │   ├── jwt.strategy.ts
│       │   │   └── jwt-auth.guard.ts
│       │   └── modules/
│       │       ├── users/        # 用户模块（Schema + CRUD + 收藏）
│       │       ├── articles/     # 文章模块（Schema + CRUD + 点赞 + 分页搜索）
│       │       ├── projects/     # 作品模块（Schema + CRUD + 技术栈筛选）
│       │       ├── auth/         # 认证模块（注册/登录 JWT + bcrypt）
│       │       └── agent/        # AI Agent 模块
│       ├── dist/             # 构建产物
│       ├── seed.mjs           # 种子脚本（node apps/api/seed.mjs 执行）
│       ├── seed-data.json     # 种子数据（8 篇文章 + 5 个项目）
│       └── nest-cli.json
├── packages/
│   ├── ui/                   # 共享组件库（shadcn/ui 基座）
│   ├── types/                # TypeScript 类型定义（IArticle, IUser, IProject, IComment 等）
│   └── ai-agent/             # DeepSeek AI 逻辑封装
├── .env                      # 环境变量（不提交 Git）
├── turbo.json                # Turborepo 任务管道
├── tsconfig.base.json        # 共享 TS 配置
└── pnpm-workspace.yaml       # pnpm workspace 声明
```

## API 接口文档

所有响应格式统一为 `{ success: boolean, data?: T, message?: string }`。

### 认证模块 (auth)

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| POST | /api/auth/register | 公开 | 注册（username + email + password） |
| POST | /api/auth/login | 公开 | 登录，返回 JWT token（7天有效） |
| GET | /api/auth/profile | JWT | 获取当前用户信息 |

### 文章模块 (articles)

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | /api/articles | 公开 | 文章列表，支持 `?tag=&page=&limit=&search=` |
| GET | /api/articles/:id | 公开 | 文章详情，自动 +1 viewCount |
| POST | /api/articles | JWT | 创建文章 |
| PUT | /api/articles/:id | JWT + 作者 | 更新文章 |
| DELETE | /api/articles/:id | JWT + 作者 | 删除文章 |
| POST | /api/articles/:id/like | 公开 | 点赞，likeCount +1 |

### 作品模块 (projects)

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | /api/projects | 公开 | 作品列表，支持 `?tech=React` 筛选 |
| GET | /api/projects/:id | 公开 | 作品详情 |
| POST | /api/projects | JWT | 创建作品 |
| PUT | /api/projects/:id | JWT | 更新作品 |
| DELETE | /api/projects/:id | JWT | 删除作品 |

### 用户模块 (users)

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | /api/users/:id | 公开 | 公开个人信息（不含 email） |
| PUT | /api/users/profile | JWT | 修改个人信息（username, avatar, bio） |
| POST | /api/users/favorites/:articleId | JWT | 收藏文章（$addToSet 去重） |
| DELETE | /api/users/favorites/:articleId | JWT | 取消收藏 |

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

### 灌入测试数据

```bash
# 确保 API 服务已启动（localhost:3001），然后执行：
node apps/api/seed.mjs
```

种子脚本会自动注册/登录 `seed_admin`、清除旧数据、从 `seed-data.json` 导入 8 篇文章和 5 个项目。

> **注意**：不要在 Windows bash 中用 curl 测试含中文的请求体——Windows 命令行对 UTF-8 编码处理有问题，会导致乱码写入 MongoDB。测试中文内容请用 Node.js fetch 或 Postman。

### 测试 API（curl 示例）

```bash
# 注册
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"123456"}'

# 登录
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# 创建文章（需 token）
curl -X POST http://localhost:3001/api/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Hello","content":"正文","tags":["tech"],"published":true}'

# 文章列表
curl "http://localhost:3001/api/articles?page=1&limit=10&tag=React&search=hello"
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
4. 遵循 Apple-esque 设计规范：使用 `glass-card`、`font-serif`、`transition-all duration-300`

```
src/app/
├── layout.tsx        # 根布局
├── page.tsx          # 首页 /
├── articles/
│   ├── page.tsx      # /articles
│   └── [id]/
│       └── page.tsx  # /articles/:id
├── projects/
│   └── page.tsx      # /projects
├── about/
│   └── page.tsx      # /about
└── login/
    └── page.tsx      # /login
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
| `NEXT_PUBLIC_API_URL` | 前端 API 地址（默认 `http://localhost:3001/api`） | 否 |

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

### 前端 API 调用规范

- 所有请求通过 `lib/api.ts` 中的封装函数发送，不要直接使用 axios
- Token 存储在 `localStorage('token')`，请求拦截器自动附加
- 页面组件先显示 `loading` 状态（`Loader2` 旋转图标），再渲染数据
- 空数据状态必须给出提示（"还没有文章" / "暂无作品"）

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
