import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';

async function bootstrap() {
  const port = Number(process.env.PORT ?? 3003);
  const localServerUrl = `http://localhost:${port}`;
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('CityDeals Backend API')
    .setDescription('Area-based coupon and directory platform API')
    .setVersion('1.0')
    .addServer(localServerUrl, 'Local development server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Paste accessToken from /auth/login or /auth/register',
        in: 'header',
      },
      'access-token',
    )
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port);
}
await bootstrap();
