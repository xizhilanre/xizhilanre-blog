// === 文章类型 ===

export interface IArticle {
  id: string;
  title: string;
  content: string;
  summary?: string;
  author: string | IUser;
  tags: string[];
  published: boolean;
  viewCount: number;
  likeCount: number;
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

export type UserRole = 'user' | 'admin';

export interface IUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  favorites: string[];
  role: UserRole;
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
  featured: boolean;
  createdAt: string;
}

export interface ICreateProject {
  title: string;
  description?: string;
  techStack?: string[];
  media?: string[];
  projectLink?: string;
  demoLink?: string;
  featured?: boolean;
}

export interface IUpdateProject {
  title?: string;
  description?: string;
  techStack?: string[];
  media?: string[];
  projectLink?: string;
  demoLink?: string;
  featured?: boolean;
}

// === 评论类型 ===

export interface IComment {
  id: string;
  articleId: string;
  author: string | IUser;
  content: string;
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
