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
