import { Module } from '@nestjs/common';
import { YoutubeServiceService } from './youtube-service.service';
import { YoutubeServiceController } from './youtube-service.controller';

@Module({
  controllers: [YoutubeServiceController],
  providers: [YoutubeServiceService],
})
export class YoutubeServiceModule {}
