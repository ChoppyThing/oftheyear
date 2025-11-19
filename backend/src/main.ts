import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

  app.enableCors({
    frontendUrl,
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // In production, fail fast if JWT_SECRET is missing
  if (configService.get('NODE_ENV') === 'production') {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      // intentionally crash to avoid running without a secret
      throw new Error(
        'JWT_SECRET is required in production. Aborting startup.',
      );
    }
  }
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  // Register global JWT guard
  const jwtGuard = app.get(JwtAuthGuard);
  app.useGlobalGuards(jwtGuard);
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
