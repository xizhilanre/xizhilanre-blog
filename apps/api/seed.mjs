import { readFileSync } from 'fs';

const BASE = 'http://localhost:3001/api';
const data = JSON.parse(readFileSync(new URL('./seed-data.json', import.meta.url), 'utf-8'));

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...options.headers,
    },
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { message: text }; }
  if (!res.ok) throw new Error(`[${res.status}] ${JSON.stringify(json).slice(0, 200)}`);
  return json;
}

async function seed() {
  // Clean up old testuser data first
  try {
    const tuLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: '123456' }),
    });
    const tuToken = tuLogin.data.token;
    const tuAuth = { headers: { Authorization: `Bearer ${tuToken}` } };
    const oldAll = await request('/articles?limit=200');
    let tuDeleted = 0;
    for (const a of oldAll.data?.items ?? []) {
      try { await request(`/articles/${a._id}`, { method: 'DELETE', ...tuAuth }); tuDeleted++; } catch {}
    }
    if (tuDeleted > 0) console.log(`已清除 testuser 的 ${tuDeleted} 篇旧文章`);
  } catch { /* testuser may not exist, that's fine */ }

  // Login
  const login = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'seed@blog.local', password: 'seed123' }),
  }).catch(async () => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username: 'seed_admin', email: 'seed@blog.local', password: 'seed123' }),
    });
  });
  const token = login.data.token;
  const auth = { headers: { Authorization: `Bearer ${token}` } };
  console.log('已登录\n');

  // Delete old articles (only those authored by this user)
  const old = await request('/articles?limit=200');
  let deleted = 0;
  for (const a of old.data?.items ?? []) {
    try { await request(`/articles/${a._id}`, { method: 'DELETE', ...auth }); deleted++; } catch {}
  }
  console.log(`已清除 ${deleted} 篇旧文章`);

  // Delete old projects
  const oldP = await request('/projects');
  let deletedP = 0;
  for (const p of oldP.data ?? []) {
    try { await request(`/projects/${p._id}`, { method: 'DELETE', ...auth }); deletedP++; } catch {}
  }
  console.log(`已清除 ${deletedP} 个旧作品\n`);

  // Seed articles
  console.log('=== 导入文章 ===');
  for (const a of data.articles) {
    const res = await request('/articles', {
      method: 'POST', body: JSON.stringify(a), ...auth,
    });
    console.log(`  OK  ${res.data.title}`);
  }

  // Seed projects
  console.log('\n=== 导入作品 ===');
  for (const p of data.projects) {
    const res = await request('/projects', {
      method: 'POST', body: JSON.stringify(p), ...auth,
    });
    console.log(`  OK  ${res.data.title}`);
  }

  console.log(`\n全部完成: ${data.articles.length} 篇文章 + ${data.projects.length} 个作品`);
}

seed().catch((err) => { console.error('脚本失败:', err.message); process.exit(1); });
