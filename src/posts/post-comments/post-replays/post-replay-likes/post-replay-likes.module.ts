import { Module } from '@nestjs/common';
import { PostReplayLikesService } from './post-replay-likes.service';
import { PostReplayLikesController } from './post-replay-likes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posts } from 'src/posts/entities/post.entity';
import { PostComments } from '../../entities/post-comments.entity';
import { PostReplays } from '../entities/post-replay.entity';
import { PostReplayLikes } from './entities/post-replay-like.entity';

@Module({
  imports : [TypeOrmModule.forFeature([Posts, PostComments, PostReplays, PostReplayLikes])],
  controllers: [PostReplayLikesController],
  providers: [PostReplayLikesService],
})
export class PostReplayLikesModule {}
