import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // app.enableCors();
  app.enableCors({
    origin: 'http://localhost:3000', // asal permintaan yang diizinkan
    methods: 'GET,POST,PUT,DELETE', // metode yang diizinkan
    allowedHeaders: 'Content-Type,Authorization', // header yang diizinkan
  });
  await app.listen(4000);
}
bootstrap();
