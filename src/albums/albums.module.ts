import { Module } from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { AlbumsController } from './albums.controller';
import { ImageModule } from 'src/image/image.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Albums } from './entities/album.entity';

@Module({
  imports : [ImageModule, TypeOrmModule.forFeature([Albums])],
  controllers: [AlbumsController],
  providers: [AlbumsService],
})
export class AlbumsModule {}
