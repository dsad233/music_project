import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { ImageModule } from 'src/image/image.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posts } from './entities/posts.entity';
import { TokenVerifyModule } from 'src/tokenverify/token.verify.module';

@Module({
  imports: [ImageModule, TokenVerifyModule, TypeOrmModule.forFeature([Posts])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
