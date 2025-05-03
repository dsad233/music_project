import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import Joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import {
  ENV_DB_HOST,
  ENV_DB_NAME,
  ENV_DB_PASSWORD,
  ENV_DB_PORT,
  ENV_DB_SYNC,
  ENV_DB_USERNAME,
  ENV_REDIS_HOST,
  ENV_REDIS_PORT,
} from './utils/const/keys';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ImageModule } from './image/image.module';
import { PostsModule } from './posts/posts.module';
import { YoutubeServiceModule } from './youtube-service/youtube-service.module';
import { AlbumsModule } from './albums/albums.module';
import { PostCommentsModule } from './posts/post-comments/post-comments.module';
import { PostLikesModule } from './posts/post-likes/post-likes.module';
import { RedisClientOptions } from 'redis';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { PostReplaysModule } from './posts/post-comments/post-replays/post-replays.module';
import { PostReplayLikesModule } from './posts/post-comments/post-replays/post-replay-likes/post-replay-likes.module';
import { AlbumCommentsModule } from './albums/album-comments/album-comments.module';
import { AlbumLikesModule } from './albums/album-likes/album-likes.module';
import { AlbumReplaysModule } from './albums/album-comments/album-replays/album-replays.module';
import { AlbumReplayLikesModule } from './albums/album-comments/album-replays/album-replay-likes/album-replay-likes.module';
import { SearchModule } from './search/search.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guard/JwtAuthGuard';

const typeOrmModuleOptions = {
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => {
    return {
      namingStrategy: new SnakeNamingStrategy(),
      type: 'mysql',
      username: configService.getOrThrow<string>(ENV_DB_USERNAME),
      password: configService.getOrThrow<string>(ENV_DB_PASSWORD),
      host: configService.getOrThrow<string>(ENV_DB_HOST),
      port: configService.getOrThrow<number>(ENV_DB_PORT),
      database: configService.getOrThrow<string>(ENV_DB_NAME),
      entities: ['dist/**/**.entity{.ts,.js}'],
      synchronize: configService.getOrThrow<boolean>(ENV_DB_SYNC),
      logging: true,
      driver: require('mysql2'),
    };
  },
  inject: [ConfigService],
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // 환경 변수 조회가 많아질 시에 사용
      cache: true,
      validationSchema: Joi.object({
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_NAME: Joi.string().required(),
        DB_SYNC: Joi.boolean().required(),
      }),
    }),
    CacheModule.registerAsync<RedisClientOptions>({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.getOrThrow<string>(ENV_REDIS_HOST),
        port: configService.getOrThrow<number>(ENV_REDIS_PORT),
        db: 1, // 0 : 애플리케이션 캐시 데이터, 1 : 세션 데이터, 2 : 비즈니스 로직 데이터
        // ttl: 180, // 레디스 캐시 항목 유효하는 시간 설정
      }),
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    UsersModule,
    AuthModule,
    ImageModule,
    PostsModule,
    PostCommentsModule,
    PostLikesModule,
    PostReplaysModule,
    PostReplayLikesModule,
    YoutubeServiceModule,
    AlbumsModule,
    AlbumCommentsModule,
    AlbumLikesModule,
    AlbumReplaysModule,
    AlbumReplayLikesModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
