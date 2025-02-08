import { Module } from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { AlbumsController } from './albums.controller';
import { ImageModule } from 'src/image/image.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Albums } from './entities/album.entity';
import { Posts } from 'src/posts/entities/posts.entity';
import { AlbumCommentsModule } from './album-comments/album-comments.module';

@Module({
  imports : [ImageModule, TypeOrmModule.forFeature([Albums, Posts]), AlbumCommentsModule],
  controllers: [AlbumsController],
  providers: [AlbumsService],
})
export class AlbumsModule {}
