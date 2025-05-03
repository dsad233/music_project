import { Module } from '@nestjs/common';
import { AlbumReplaysService } from './album-replays.service';
import { AlbumReplaysController } from './album-replays.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlbumReplays } from './entities/album-replay.entity';
import { Albums } from 'src/albums/entities/album.entity';
import { AlbumComments } from '../entities/album-comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Albums, AlbumComments, AlbumReplays])],
  controllers: [AlbumReplaysController],
  providers: [AlbumReplaysService],
})
export class AlbumReplaysModule {}
