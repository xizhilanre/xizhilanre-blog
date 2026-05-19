import * as request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { INestApplication } from '@nestjs/common';
import { createTestApp, clearData, userDocs } from './test-utils';

describe('Auth API', () => {
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

  // ─── Login ──────────────────────────────────────────────

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const hash = await bcrypt.hash('correct123', 10);
      userDocs.set('user1', {
        _id: 'user1',
        username: 'admin',
        email: 'admin@blog.local',
        passwordHash: hash,
        role: 'admin',
      });
    });

    it('should login with correct credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@blog.local', password: 'correct123' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject wrong password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@blog.local', password: 'wrongpass' });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('should reject non-existent email', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: '123456' });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });
});
