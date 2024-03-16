import {NestFactory} from '@nestjs/core';
import {Logger} from 'nestjs-pino';
import {AppModule} from './app.module';
import {loadEager} from './config/configuration';

async function bootstrap() {
  await loadEager();
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    cors: true,
  });
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT);
}

bootstrap();
