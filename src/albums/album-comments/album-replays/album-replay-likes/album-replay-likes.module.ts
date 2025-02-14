import { Module } from '@nestjs/common';
import { AlbumReplayLikesService } from './album-replay-likes.service';
import { AlbumReplayLikesController } from './album-replay-likes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Albums } from 'src/albums/entities/album.entity';
import { AlbumComments } from '../../entities/album-comment.entity';
import { AlbumReplays } from '../entities/album-replay.entity';
import { AlbumReplayLikes } from './entities/album-replay-like.entity';

@Module({
  imports : [TypeOrmModule.forFeature([Albums, AlbumComments, AlbumReplays, AlbumReplayLikes])],
  controllers: [AlbumReplayLikesController],
  providers: [AlbumReplayLikesService],
})
export class AlbumReplayLikesModule {}
