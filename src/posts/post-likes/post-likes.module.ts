import { Module } from '@nestjs/common';
import { PostLikesService } from './post-likes.service';
import { PostLikesController } from './post-likes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostLikes } from './entities/post-likes.entity';
import { Posts } from '../entities/post.entity';
import { PostsModule } from '../posts.module';

@Module({
  imports : [PostsModule, TypeOrmModule.forFeature([Posts, PostLikes])],
  controllers: [PostLikesController],
  providers: [PostLikesService],
})
export class PostLikesModule {}
