import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import Joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import { ENV_DB_HOST, ENV_DB_NAME, ENV_DB_PASSWORD, ENV_DB_PORT, ENV_DB_SYNC, ENV_DB_USERNAME } from './const/keys';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ImageModule } from './image/image.module';
import { ImageModule } from './image/image.module';


const typeOrmModuleOptions = {
  useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
    return ({
      namingStrategy: new SnakeNamingStrategy(),
      type: 'postgres',
      username: configService.get<string>(ENV_DB_USERNAME),
      password: configService.get<string>(ENV_DB_PASSWORD),
      host: configService.get<string>(ENV_DB_HOST),
      port: configService.get<number>(ENV_DB_PORT),
      database: configService.get<string>(ENV_DB_NAME),
      entities: ['dist/**/**.entity{.ts,.js}'],
      synchronize: configService.get<boolean>(ENV_DB_SYNC),
      logging: true,
    });
  },
  inject: [ConfigService],
};

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    validationSchema: Joi.object({
      DB_USERNAME: Joi.string().required(),
      DB_PASSWORD: Joi.string().required(),
      DB_HOST: Joi.string().required(),
      DB_PORT: Joi.number().required(),
      DB_NAME: Joi.string().required(),
      DB_SYNC: Joi.boolean().required(),
    }),
  }),
  TypeOrmModule.forRootAsync(typeOrmModuleOptions),UsersModule, AuthModule, ImageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
