import { Module } from '@nestjs/common';
import { PostReplaysService } from './post-replays.service';
import { PostReplaysController } from './post-replays.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostReplays } from './entities/post-replay.entity';
import { Posts } from 'src/posts/entities/posts.entity';
import { PostComments } from '../entities/post-comments.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Posts, PostComments, PostReplays])],
  controllers: [PostReplaysController],
  providers: [PostReplaysService],
})
export class PostReplaysModule {}
