import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, clearData } from './test-utils';

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

  // ─── Register ──────────────────────────────────────────

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ username: 'testuser', email: 'test@example.com', password: '123456' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.username).toBe('testuser');
    });

    it('should reject duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ username: 'user1', email: 'dup@example.com', password: '123456' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ username: 'user2', email: 'dup@example.com', password: '123456' });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('should reject missing email', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ username: 'test', password: '123456' })
        .expect(400);

      expect(res.body.message).toBeDefined();
    });

    it('should reject short password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ username: 'test', email: 'short@example.com', password: '12' })
        .expect(400);

      expect(res.body.message).toBeDefined();
    });

    it('should reject invalid email format', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ username: 'test', email: 'not-an-email', password: '123456' })
        .expect(400);

      expect(res.body.message).toBeDefined();
    });
  });

  // ─── Login ──────────────────────────────────────────────

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ username: 'logintest', email: 'login@example.com', password: 'correct123' });
    });

    it('should login with correct credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'correct123' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject wrong password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'wrongpass' });

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
