// 本地类型定义 — 页面 Props、表单数据等

/** 文章列表页搜索参数 */
export interface ArticleSearchParams {
  page?: string;
  tag?: string;
  q?: string;
}

/** 联系表单数据 */
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

// MongoDB 文档类型（使用 _id）
export interface ArticleDoc {
  _id: string;
  id?: string;
  title: string;
  content: string;
  summary?: string;
  author: string | { _id: string; username: string; avatar?: string };
  tags: string[];
  published: boolean;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RelatedArticle {
  id?: string;
  _id?: string;
  title: string;
  summary?: string;
}

export interface ProjectDoc {
  _id: string;
  title: string;
  description?: string;
  techStack: string[];
  media: string[];
  projectLink?: string;
  demoLink?: string;
  featured: boolean;
  createdAt: string;
}
