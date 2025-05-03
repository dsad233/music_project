import { Module } from '@nestjs/common';
import { AlbumCommentsService } from './album-comments.service';
import { AlbumCommentsController } from './album-comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlbumComments } from './entities/album-comment.entity';
import { Albums } from '../entities/album.entity';
import { TokenVerifyModule } from 'src/tokenverify/token.verify.module';

@Module({
  imports: [
    TokenVerifyModule,
    TypeOrmModule.forFeature([Albums, AlbumComments]),
  ],
  controllers: [AlbumCommentsController],
  providers: [AlbumCommentsService],
})
export class AlbumCommentsModule {}
