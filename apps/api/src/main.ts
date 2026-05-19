import { NestFactory } from '@nestjs/core';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api', {
    exclude: [
      { path: '/', method: RequestMethod.GET },
      { path: 'health', method: RequestMethod.GET },
    ],
  });

  const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : [];
  const devOrigins = ['http://localhost:3000'];

  app.enableCors({
    origin: (origin, cb) => {
      // non-browser requests (curl, etc.) — allow
      if (!origin) return cb(null, true);
      // exact match for configured origins or localhost
      if (allowedOrigins.includes(origin) || devOrigins.includes(origin))
        return cb(null, true);
      // Vercel preview deployments: *-username.vercel.app or *-username-projects.vercel.app
      if (/^https:\/\/.*-xizhilanre.*\.vercel\.app$/.test(origin))
        return cb(null, true);
      cb(null, false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`API listening on port ${port}`);
}

bootstrap();
