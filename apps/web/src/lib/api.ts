import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message ?? error.message ?? '网络错误';
    return Promise.reject(new Error(message));
  },
);

// ---- Auth ----

export async function register(data: {
  username: string;
  email: string;
  password: string;
}) {
  const res = await api.post('/auth/register', data);
  return res.data;
}

export async function login(data: { email: string; password: string }) {
  const res = await api.post('/auth/login', data);
  return res.data;
}

export async function getProfile() {
  const res = await api.get('/auth/profile');
  return res.data;
}

// ---- Articles ----

export async function getArticles(params?: {
  tag?: string;
  page?: number;
  limit?: number;
  search?: string;
}) {
  const res = await api.get('/articles', { params });
  return res.data;
}

export async function getArticle(id: string) {
  const res = await api.get(`/articles/${id}`);
  return res.data;
}

export async function createArticle(data: {
  title: string;
  content: string;
  summary?: string;
  tags?: string[];
  published?: boolean;
}) {
  const res = await api.post('/articles', data);
  return res.data;
}

export async function updateArticle(
  id: string,
  data: Record<string, unknown>,
) {
  const res = await api.put(`/articles/${id}`, data);
  return res.data;
}

export async function deleteArticle(id: string) {
  const res = await api.delete(`/articles/${id}`);
  return res.data;
}

export async function likeArticle(id: string) {
  const res = await api.post(`/articles/${id}/like`);
  return res.data;
}

// ---- Projects ----

export async function getProjects(tech?: string) {
  const res = await api.get('/projects', { params: { tech } });
  return res.data;
}

export async function getProject(id: string) {
  const res = await api.get(`/projects/${id}`);
  return res.data;
}

export async function createProject(data: Record<string, unknown>) {
  const res = await api.post('/projects', data);
  return res.data;
}

export async function updateProject(
  id: string,
  data: Record<string, unknown>,
) {
  const res = await api.put(`/projects/${id}`, data);
  return res.data;
}

export async function deleteProject(id: string) {
  const res = await api.delete(`/projects/${id}`);
  return res.data;
}

// ---- Agent ----

export async function agentSummarize(content: string) {
  const res = await api.post('/agent/summarize', { content });
  return res.data;
}

export async function agentRecommend(articleId: string, tags: string[]) {
  const res = await api.post('/agent/recommend', { articleId, tags });
  return res.data;
}

export async function agentWrite(title: string, keywords: string[], style?: string) {
  const res = await api.post('/agent/write', { title, keywords, style });
  return res.data;
}

// ---- Users ----

export async function getUser(id: string) {
  const res = await api.get(`/users/${id}`);
  return res.data;
}

export async function updateProfile(data: Record<string, unknown>) {
  const res = await api.put('/users/profile', data);
  return res.data;
}

export async function addFavorite(articleId: string) {
  const res = await api.post(`/users/favorites/${articleId}`);
  return res.data;
}

export async function removeFavorite(articleId: string) {
  const res = await api.delete(`/users/favorites/${articleId}`);
  return res.data;
}
