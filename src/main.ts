import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ErrorException } from './middleware/errorException';
import { LoggerMiddleware } from './middleware/logger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3111'],
    credentials: true,
    exposedHeaders: ['Authorization'],
    maxAge : 3600
  });

  // logger 미들웨어
  app.use(new LoggerMiddleware().use.bind(new LoggerMiddleware()));
  app.use(cookieParser());
  // error 미들웨어
  app.useGlobalFilters(new ErrorException());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  
  await app.listen(3000);
  Logger.log("서버 주소 : http://localhost:3000");
}
bootstrap();
