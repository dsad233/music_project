import { Module } from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { AlbumsController } from './albums.controller';
import { ImageModule } from 'src/image/image.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Albums } from './entities/album.entity';
import { Posts } from 'src/posts/entities/post.entity';

@Module({
  imports : [ImageModule, TypeOrmModule.forFeature([Albums, Posts])],
  controllers: [AlbumsController],
  providers: [AlbumsService],
})
export class AlbumsModule {}
