// === 文章类型 ===

export interface IArticle {
  id: string;
  title: string;
  content: string;
  summary?: string;
  author: string;
  tags: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateArticle {
  title: string;
  content: string;
  summary?: string;
  tags?: string[];
  published?: boolean;
}

export interface IUpdateArticle {
  title?: string;
  content?: string;
  summary?: string;
  tags?: string[];
  published?: boolean;
}

// === 用户类型 ===

export interface IUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  favorites: string[];
}

// === 作品类型 ===

export interface IProject {
  id: string;
  title: string;
  description?: string;
  techStack: string[];
  media: string[];
  projectLink?: string;
  demoLink?: string;
  createdAt: string;
}

// === API 响应类型 ===

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: number;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
