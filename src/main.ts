import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import 'module-alias/register';

async function bootstrap() {
  const APP_PORT = process.env.APP_PORT || 3000;
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');
  app.useStaticAssets(join(__dirname, '..', 'public'));

  const config = new DocumentBuilder()
    .setTitle('Genesis Weather API')
    .setDescription('Genesis Weather API description')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  await app.listen(APP_PORT, () =>
    console.log(`===>>>> Server is running on port ${APP_PORT}`),
  );
}

bootstrap();
