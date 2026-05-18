# CLAUDE.md — xizhilanre-blog 项目工作手册

## 项目概述

这是一个现代化个人博客 + 作品集独立站，采用 Monorepo 架构。

- 前端：Next.js 14 (App Router) + TailwindCSS + shadcn/ui
- 后端：NestJS + MongoDB (Mongoose)
- AI：deepseek API集成，还可支持多种OpenAI格式
- Turborepo Monorepo

## 目录结构

```
xizhilanre-blog/
├─ apps/
│   ├─ web/           # Next.js 前端（端口 3000）
│   └─ api/           # NestJS 后端（端口 3001）
├─ packages/
│   ├─ ui/            # 共享组件库
│   ├─ types/         # TypeScript 类型定义
│   └─ ai-agent/      # AI Agent 逻辑
├─ .env               # 环境变量（不得提交 Git）
├─ CLAUDE.md          # 本文件
└─ package.json
```

## 编码规范（必须遵守）

1. **TypeScript 严格模式**：所有文件使用 TypeScript，不允许 `any` 类型
2. **命名规范**：
   - 组件：PascalCase（ArticleCard.tsx）
   - 函数/变量：camelCase（getArticles）
   - 常量：UPPER_SNAKE_CASE（MAX_PAGE_SIZE）
   - API 路由：kebab-case（/api/articles/:id）
3. **注释语言**：注释和文档使用中文
4. **每个功能模块创建后必须告知用户验证步骤**
5. 每次开发完成后，将所做的改动更新到dev.md中

## 安全规范（强制执行）

- 永远不在代码中硬编码密钥或密码
- 所有敏感值从 `process.env` 读取
- `.env` 文件必须在 `.gitignore` 中
- API 接口必须做输入验证

## API 设计规范

- RESTful 风格
- 所有响应格式统一为：
  ```json
  { "success": true, "data": {}, "message": "操作成功" }
  { "success": false, "error": "错误描述", "code": 400 }
  ```
- 分页参数：`?page=1&limit=10`

## 数据库模型（参考）

### Article（文章）

- title: String（必填，最长200字）
- content: String（必填，Markdown）
- summary: String（AI生成摘要）
- author: ObjectId → User
- tags: [String]
- published: Boolean（默认false）
- createdAt / updatedAt: Date

### User（用户）

- username: String（必填，唯一）
- email: String（必填，唯一）
- passwordHash: String
- avatar: String（URL）
- bio: String
- favorites: [ObjectId → Article]

### Project（作品）

- title: String（必填）
- description: String
- techStack: [String]
- media: [String]（URL数组）
- projectLink: String
- demoLink: String
- createdAt: Date

## AI Agent 规范

- Summarize Agent：输入文章内容，输出中文摘要（≤150字）
- Recommend Agent：输入当前文章标签，返回3篇相关文章ID
- Write Agent：输入标题和关键词，输出文章大纲

## 任务执行规范

1. 每次完成一个功能后，输出验证清单（用户可对照检查）
2. 遇到错误，先自行尝试修复，3次失败后告知用户具体错误
3. 创建文件时，同步更新对应的 TypeScript 类型
4. 前端组件必须包含加载状态和错误状态
5. 严禁删除 .env 文件或覆盖用户已填写的配置

## 当前进度记录

（AI 每完成一个阶段，在此更新）

- [ ] 阶段1：Monorepo 初始化
- [ ] 阶段2：后端 API（用户/文章/作品）
- [ ] 阶段3：前端页面（首页/文章/作品/关于）
- [ ] 阶段4：AI Agent 集成
- [ ] 阶段5：测试 & 优化
- [ ] 阶段6：部署上线
