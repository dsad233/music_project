import { Module } from '@nestjs/common';
import { AlbumLikesService } from './album-likes.service';
import { AlbumLikesController } from './album-likes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Albums } from '../entities/album.entity';
import { AlbumLikes } from './entities/album-like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Albums, AlbumLikes])],
  controllers: [AlbumLikesController],
  providers: [AlbumLikesService],
})
export class AlbumLikesModule {}
