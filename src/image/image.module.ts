import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ConfigService } from '@nestjs/config';


@Module({
  imports : [ConfigService],
  providers: [ImageService],
})
export class ImageModule {}
