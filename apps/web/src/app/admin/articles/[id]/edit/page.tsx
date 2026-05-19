'use client';

import { useParams } from 'next/navigation';
import ArticleEditor from '@/components/admin/article-editor';

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <ArticleEditor id={id} />;
}
