import { Module } from '@nestjs/common';
import { PostLikesService } from './post-likes.service';
import { PostLikesController } from './post-likes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostLikes } from './entities/post-likes.entity';
import { Posts } from 'src/posts/entities/posts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Posts, PostLikes])],
  controllers: [PostLikesController],
  providers: [PostLikesService],
})
export class PostLikesModule {}
