import { Module } from '@nestjs/common';
import { PostReplayLikesService } from './post-replay-likes.service';
import { PostReplayLikesController } from './post-replay-likes.controller';

@Module({
  controllers: [PostReplayLikesController],
  providers: [PostReplayLikesService],
})
export class PostReplayLikesModule {}
