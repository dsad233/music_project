import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ErrorException } from './middleware/errorException';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3111'],
    credentials: true,
    exposedHeaders: ['Authorization'],
    maxAge : 3600
  });

  app.use(cookieParser());
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
