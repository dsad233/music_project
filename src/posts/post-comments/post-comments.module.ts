import { Module } from '@nestjs/common';
import { PostCommentsService } from './post-comments.service';
import { PostCommentsController } from './post-comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostComments } from './entities/post-comments.entity';
import { Posts } from '../entities/post.entity';
import { PostsModule } from '../posts.module';

@Module({
  imports : [PostsModule, TypeOrmModule.forFeature([Posts, PostComments])],
  controllers: [PostCommentsController],
  providers: [PostCommentsService],
})
export class PostCommentsModule {}
