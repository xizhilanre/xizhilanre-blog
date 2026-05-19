# xizhilanre-blog

个人技术博客 — Next.js 14 前端 + NestJS 后端 + MongoDB，pnpm monorepo 架构。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Next.js 14, React 18, Tailwind CSS, Framer Motion, SWR |
| 后端 | NestJS 10, MongoDB + Mongoose, Passport JWT |
| AI | DeepSeek Chat API（文章摘要 / 推荐 / 大纲生成） |
| 构建 | Turborepo, pnpm workspace |

## 快速开始

```bash
pnpm install
cp .env.example .env  # 编辑填写环境变量
pnpm dev               # 并行启动 web (3000) + api (3001)
```

详细文档见 [dev.md](./dev.md)。

## Vercel 部署（前端）

### 1. 准备工作

确认后端 API 已部署到 Render（或其它服务器），记录 API 地址，例如 `https://xizhilanre-api.onrender.com/api`。

### 2. 导入项目到 Vercel

1. 在 [Vercel](https://vercel.com) 导入 GitHub 仓库
2. **Framework** 选择 `Next.js`
3. **Root Directory** 设置为 `apps/web`
4. 展开 **Build and Output Settings**，覆盖以下字段：

| 字段 | 值 |
|---|---|
| Build Command | `cd ../.. && pnpm turbo build --filter=@xizhilanre/web` |
| Install Command | `cd ../.. && pnpm install --frozen-lockfile` |
| Output Directory | `.next` |

### 3. 设置环境变量

在 Vercel 项目 Settings → Environment Variables 中添加：

| 变量名 | 值 |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://xizhilanre-api.onrender.com/api` |

> 环境变量已在 `apps/web/.env.example` 中列出，修改后添加到 Vercel。

### 4. 部署

推送代码到 GitHub 主分支，Vercel 会自动触发部署。也可以在 Dashboard 手动触发 Deploy。

> **注意**：`next.config.mjs` 中 `remotePatterns` 已配置允许所有 HTTPS 域名（`hostname: '**'`），外部图片可直接显示。如需更严格的安全策略，请自行缩小允许的域名范围。

## Render 部署（后端）

详见 `apps/api/render.yaml`，一键部署配置已就绪。

### 环境变量

在 Render 项目 Environment 中添加：

| 变量 | 说明 |
|---|---|
| `MONGODB_URI` | MongoDB 连接字符串 |
| `JWT_SECRET` | JWT 签名密钥（≥32 字符） |
| `OPENAI_API_KEY` | DeepSeek API Key |
| `OPENAI_API_BASE` | `https://api.deepseek.com/v1` |
| `FRONTEND_URL` | 前端 Vercel 域名（CORS 白名单） |

`NODE_ENV=production` 和 `PORT=3001` 已在 `render.yaml` 中预设。
