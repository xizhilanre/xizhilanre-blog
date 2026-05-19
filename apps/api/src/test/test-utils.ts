import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { getModelToken } from '@nestjs/mongoose';
import { JwtStrategy } from '../common/jwt.strategy';
import { AuthController } from '../modules/auth/auth.controller';
import { AuthService } from '../modules/auth/auth.service';
import { ArticlesController } from '../modules/articles/articles.controller';
import { ArticlesService } from '../modules/articles/articles.service';

// ─── In-memory stores ────────────────────────────────────

const userDocs = new Map<string, any>();
const articleDocs = new Map<string, any>();
let nextId = 1;

export function uid() {
  return String((nextId++).toString(16).padStart(8, '0'));
}

export function clearData() {
  userDocs.clear();
  articleDocs.clear();
  nextId = 1;
}

// ─── Thenable chain helper ───────────────────────────────
// Mongoose Query objects are thenable — they can be awaited directly.
// Our mocks must behave the same way.

function asThenable<T>(promise: Promise<T>) {
  return {
    exec: () => promise,
    then: (resolve: any, reject: any) => promise.then(resolve, reject),
  };
}

function chain(items: any[]) {
  let skipVal = 0;
  let limitVal = items.length;
  const resolve = () => Promise.resolve(items.slice(skipVal, skipVal + limitVal));
  const c: any = {
    exec: resolve,
    lean: resolve,
    sort: () => c,
    skip: (n: number) => { skipVal = n; return c; },
    limit: (n: number) => { limitVal = n; return c; },
    populate: () => c,
    select: () => c,
    then: (resolveFn: any, reject: any) => resolve().then(resolveFn, reject),
  };
  return c;
}

function applyUpdates(doc: any, update: any) {
  if (!update) return;
  if (update.$set) Object.assign(doc, update.$set);
  if (update.$inc) {
    for (const [k, v] of Object.entries(update.$inc)) {
      doc[k] = (doc[k] ?? 0) + (v as number);
    }
  }
  for (const [k, v] of Object.entries(update)) {
    if (!k.startsWith('$')) doc[k] = v;
  }
}

// ─── Model mocks ─────────────────────────────────────────

function fakeModel(name: string, store: Map<string, any>) {
  return {
    name,

    findById: jest.fn((id: string) => {
      const doc = store.get(id);
      const result = doc ? { ...doc, _id: id } : null;
      const promise = Promise.resolve(result);
      return {
        exec: () => promise,
        lean: () => promise,
        select: () => ({ exec: () => promise }),
        populate: () => ({ exec: () => promise }),
        then: (resolveFn: any, reject: any) => promise.then(resolveFn, reject),
      };
    }),

    findOne: jest.fn((query: any) => {
      const promise = (async () => {
        for (const [, doc] of store) {
          if (query.email && doc.email === query.email) return { ...doc };
          if (query._id && doc._id === query._id) return { ...doc };
        }
        return null;
      })();
      return asThenable(promise);
    }),

    find: jest.fn((filter?: any) => {
      let items = [...store.values()];
      if (filter) {
        if (filter.published !== undefined) {
          items = items.filter((d: any) => d.published === filter.published);
        }
        if (filter.tags) {
          items = items.filter((d: any) => (d.tags ?? []).includes(filter.tags));
        }
      }
      return chain(items);
    }),

    findByIdAndUpdate: jest.fn((id: string, update: any) => {
      const promise = (async () => {
        if (!store.has(id)) return null;
        const doc = store.get(id);
        applyUpdates(doc, update);
        return { ...doc, _id: id };
      })();
      return {
        exec: () => promise,
        populate: () => ({ lean: () => promise, exec: () => promise }),
        lean: () => promise,
        then: (resolve: any, reject: any) => promise.then(resolve, reject),
      };
    }),

    findByIdAndDelete: jest.fn((id: string) => {
      const promise = (async () => {
        if (store.has(id)) {
          const doc = store.get(id);
          store.delete(id);
          return doc;
        }
        return null;
      })();
      return asThenable(promise);
    }),

    create: jest.fn(async (doc: any) => {
      const id = uid();
      const saved = {
        _id: id,
        ...doc,
        save: async () => saved,
        populate: () => Promise.resolve({ _id: id, ...doc }),
      };
      store.set(id, saved);
      return saved;
    }),

    deleteOne: jest.fn((query: any) => {
      const promise = (async () => {
        if (query._id) store.delete(query._id);
      })();
      return asThenable(promise);
    }),

    countDocuments: jest.fn((filter?: any) => {
      let count = 0;
      for (const [, doc] of store) {
        if (filter) {
          if (filter.published !== undefined && doc.published !== filter.published) continue;
          if (filter.tags && !(doc.tags ?? []).includes(filter.tags)) continue;
        }
        count++;
      }
      return asThenable(Promise.resolve(count));
    }),
  };
}

export const mockUserModel = fakeModel('User', userDocs);
export const mockArticleModel = fakeModel('Article', articleDocs);

// ─── Test App Factory ────────────────────────────────────

export async function createTestApp(
  extras: { controllers?: any[]; providers?: any[] } = {},
): Promise<{
  app: INestApplication;
  jwtService: JwtService;
  moduleFixture: TestingModule;
}> {
  const moduleFixture = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        load: [() => ({ JWT_SECRET: 'test-secret-at-least-32-chars-long-string' })],
        isGlobal: true,
      }),
      PassportModule.register({ defaultStrategy: 'jwt' }),
      JwtModule.registerAsync({
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          secret: config.getOrThrow<string>('JWT_SECRET'),
          signOptions: { expiresIn: '1h' },
        }),
      }),
    ],
    controllers: [AuthController, ArticlesController, ...(extras.controllers ?? [])],
    providers: [
      JwtStrategy,
      AuthService,
      ArticlesService,
      { provide: getModelToken('User'), useValue: mockUserModel },
      { provide: getModelToken('Article'), useValue: mockArticleModel },
      ...(extras.providers ?? []),
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  await app.init();

  const jwtService = moduleFixture.get<JwtService>(JwtService);
  return { app, jwtService, moduleFixture };
}

export { userDocs, articleDocs };
