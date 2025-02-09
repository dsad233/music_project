import { Module } from '@nestjs/common';
import { AlbumCommentsService } from './album-comments.service';
import { AlbumCommentsController } from './album-comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlbumComments } from './entities/album-comment.entity';
import { Albums } from '../entities/album.entity';

@Module({
  imports : [TypeOrmModule.forFeature([Albums, AlbumComments])],
  controllers: [AlbumCommentsController],
  providers: [AlbumCommentsService],
})
export class AlbumCommentsModule {}
