import { Module } from '@nestjs/common';
import { PostCommentsService } from './post-comments.service';
import { PostCommentsController } from './post-comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostComments } from './entities/post-comments.entity';
import { Posts } from '../entities/posts.entity';
import { TokenVerifyModule } from 'src/tokenverify/token.verify.module';

@Module({
  imports: [TokenVerifyModule, TypeOrmModule.forFeature([Posts, PostComments])],
  controllers: [PostCommentsController],
  providers: [PostCommentsService],
})
export class PostCommentsModule {}
