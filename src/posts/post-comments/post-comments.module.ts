import { Module } from '@nestjs/common';
import { PostCommentsService } from './post-comments.service';
import { PostCommentsController } from './post-comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostComments } from './entities/post-comments.entity';
import { Posts } from '../entities/post.entity';
import { PostCommentLikesModule } from './post-comment-likes/post-comment-likes.module';

@Module({
  imports : [TypeOrmModule.forFeature([Posts, PostComments]), PostCommentLikesModule],
  controllers: [PostCommentsController],
  providers: [PostCommentsService],
})
export class PostCommentsModule {}
