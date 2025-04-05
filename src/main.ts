import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const port = configService.get('APP_PORT') || 4000;
  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .addTag('api')
    .addBearerAuth() // If you're using JWT authentication
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  app.enableCors({
    origin: (req, callback) => callback(null, true),
  });
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(port, () => {
    console.log('App is running on %s port', port);
  });
}
bootstrap();
