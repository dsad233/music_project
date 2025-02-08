import { Module } from '@nestjs/common';
import { PostReplaysService } from './post-replays.service';
import { PostReplaysController } from './post-replays.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostReplays } from './entities/post-replay.entity';
import { Posts } from 'src/posts/entities/posts.entity';
import { PostComments } from '../entities/post-comments.entity';
import { PostReplayLikesModule } from './post-replay-likes/post-replay-likes.module';

@Module({
  imports : [TypeOrmModule.forFeature([Posts, PostComments, PostReplays]), PostReplayLikesModule],
  controllers: [PostReplaysController],
  providers: [PostReplaysService],
})
export class PostReplaysModule {}
