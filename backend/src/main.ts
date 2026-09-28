import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // We will configure body parsers manually
  });
  const configService = app.get(ConfigService);

  // ── Body size limits (must be before routes) ─────────────────────────────
  // NestJS wraps Express — increase limits so large GLB multipart uploads
  // (up to 50 MB) are not silently rejected at the HTTP layer.
  const express = await import('express');
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // ── Global prefix ────────────────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── CORS ─────────────────────────────────────────────────────────────────
  const configuredFrontend = configService.get<string>('frontendUrl');
  const allowedOrigins = [
    configuredFrontend,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:3000',
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS origin ${origin} not allowed`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });

  // ── Validation ───────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ── Global filters & interceptors ─────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // ── Swagger ───────────────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('African Rent Car API')
    .setDescription(
      `## 🚗 African Rent Car — REST API\n\n` +
      `Full-stack car rental and vacation accommodation management system built with **NestJS**, **MongoDB**, and **Cloudinary**.\n\n` +
      `### Authentication\n` +
      `Most endpoints require a valid **JWT Bearer token**.\n` +
      `Obtain a token via \`POST /api/auth/login\` or \`POST /api/auth/register\`, ` +
      `then click **Authorize** and paste: \`Bearer <your_token>\`\n\n` +
      `### Roles\n` +
      `- **admin** — full access to all resources\n` +
      `- **customer** — can browse vehicles and manage own reservations`,
    )
    .setVersion('1.0')
    .setContact('African Rent Car', 'https://africanrentcar.com', 'contact@africanrentcar.com')
    .setLicense('Proprietary', '')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Enter: Bearer <JWT>' },
      'JWT',
    )
    .addTag('Auth', 'Registration, login and current-user endpoints')
    .addTag('Users', 'User profile management (admin or owner only)')
    .addTag('Vehicles', 'Vehicle catalogue — public reads, admin writes')
    .addTag('Apartments', 'Vacation rentals and holiday apartments catalogue and bookings')
    .addTag('Excursions', 'Guided field trips and desert tours catalogue and bookings')
    .addTag('Reservations', 'Car rental booking creation and management')
    .addTag('Upload', 'Cloudinary image upload (admin only)')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
    customSiteTitle: 'African Rent Car — API Docs',
  });

  // ── Start ─────────────────────────────────────────────────────────────────
  const port = configService.get<number>('port') || 3000;
  await app.listen(port);
  console.log(`🚀 African Rent Car API running on http://localhost:${port}/api`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/api/docs`);
}
bootstrap();

