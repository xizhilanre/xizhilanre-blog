import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, clearData, articleDocs, userDocs } from './test-utils';

describe('Articles API', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const result = await createTestApp();
    app = result.app;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    clearData();
  });

  // ─── GET /api/articles ──────────────────────────────────

  describe('GET /api/articles', () => {
    it('should return empty list when no articles exist', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/articles')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toEqual([]);
      expect(res.body.data.total).toBe(0);
    });

    it('should return published articles only', async () => {
      const authorId = 'user1';
      userDocs.set(authorId, {
        _id: authorId,
        username: 'tester',
        email: 'tester@example.com',
        passwordHash: 'hash',
        role: 'user',
      });

      for (let i = 1; i <= 5; i++) {
        articleDocs.set(`art${i}`, {
          _id: `art${i}`,
          title: `Article ${i}`,
          content: `Content ${i}`,
          tags: ['tech'],
          published: true,
          author: authorId,
          viewCount: i * 10,
          likeCount: i,
        });
      }
      articleDocs.set('draft1', {
        _id: 'draft1',
        title: 'Draft',
        content: 'draft content',
        tags: [],
        published: false,
        author: authorId,
        viewCount: 0,
        likeCount: 0,
      });

      const res = await request(app.getHttpServer())
        .get('/api/articles')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(5);
      expect(res.body.data.total).toBe(5);
    });

    it('should paginate with page and limit params', async () => {
      const authorId = 'user1';
      userDocs.set(authorId, {
        _id: authorId,
        username: 'tester',
        email: 'tester@example.com',
        passwordHash: 'hash',
        role: 'user',
      });

      for (let i = 1; i <= 10; i++) {
        articleDocs.set(`art${i}`, {
          _id: `art${i}`,
          title: `Article ${i}`,
          content: `Content ${i}`,
          tags: ['tech'],
          published: true,
          author: authorId,
          viewCount: i,
          likeCount: i,
        });
      }

      const res = await request(app.getHttpServer())
        .get('/api/articles?page=2&limit=3')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(3);
      expect(res.body.data.total).toBe(10);
      expect(res.body.data.page).toBe(2);
      expect(res.body.data.limit).toBe(3);
      expect(res.body.data.totalPages).toBe(4);
    });
  });

  // ─── POST /api/articles ─────────────────────────────────

  describe('POST /api/articles', () => {
    it('should reject request without JWT', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/articles')
        .send({ title: 'No Auth', content: 'should fail', tags: ['test'] });

      expect(res.status).toBeGreaterThanOrEqual(401);
    });

    it('should create article with valid JWT', async () => {
      const reg = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ username: 'author1', email: 'author1@example.com', password: 'pass123' })
        .expect(201);

      const token = reg.body.data.token;

      const res = await request(app.getHttpServer())
        .post('/api/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'My Article', content: 'Hello world', tags: ['js', 'node'] })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('My Article');
      expect(res.body.data.tags).toEqual(['js', 'node']);
      expect(res.body.message).toBe('文章创建成功');
    });
  });
});
