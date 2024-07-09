import { Controller, Get, Param } from '@nestjs/common';
import { YoutubeServiceService } from './youtube-service.service';
// import { CreateYoutubeServiceDto } from './dto/create-youtube-service.dto';
// import { UpdateYoutubeServiceDto } from './dto/update-youtube-service.dto';

@Controller('youtube-service')
export class YoutubeServiceController {
  constructor(private readonly youtubeServiceService: YoutubeServiceService) {}


  // 동영상 정보 검색 (동영상 Id만 입력해서 검색)
  @Get('/video/:videoid')
  async getVideo(@Param('videoid') videoid: string) {
    return this.youtubeServiceService.getVideoDetails(videoid);
  }

  // 채널 정보 검색 (channelId로만 검색이 가능)
  @Get('/channel/:channelId')
  async getChannel(@Param('channelId') channelId: string) {
    return this.youtubeServiceService.getChannel(channelId);
  }

  // 유튜브 검색
  @Get('/search/:title')
  async getSearch(@Param('title') title: string) {
    return this.youtubeServiceService.getSearch(title);
  }

  // 채널이름 검색(@제외 채널아이디로만)
  @Get('/channelname/:channelName')
  async getChannelName(@Param('channelName') channelName : string) {
    return this.youtubeServiceService.getChannelName(channelName);
  }
}
