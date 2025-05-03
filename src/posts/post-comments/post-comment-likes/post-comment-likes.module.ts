import { Module } from '@nestjs/common';
import { PostCommentLikesService } from './post-comment-likes.service';
import { PostCommentLikesController } from './post-comment-likes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posts } from 'src/posts/entities/posts.entity';
import { PostComments } from '../entities/post-comments.entity';
import { PostCommentLikes } from './entities/post-comment-like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Posts, PostComments, PostCommentLikes])],
  controllers: [PostCommentLikesController],
  providers: [PostCommentLikesService],
})
export class PostCommentLikesModule {}
