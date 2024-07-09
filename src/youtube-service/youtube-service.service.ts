import { Injectable, NotFoundException } from '@nestjs/common';
// import { CreateYoutubeServiceDto } from './dto/create-youtube-service.dto';
// import { UpdateYoutubeServiceDto } from './dto/update-youtube-service.dto';
import { ConfigService } from '@nestjs/config';
import { ENV_Youtube_ApiKey, ENV_Youtube_ApiUrl, ENV_Youtube_Channel, ENV_Youtube_Search } from 'src/const/keys';
import axios from 'axios';

@Injectable()
export class YoutubeServiceService {
  constructor(private readonly configService : ConfigService){}
  private readonly apiKey = this.configService.get<string>(ENV_Youtube_ApiKey);
  private readonly apiUrl_Video = this.configService.get<string>(ENV_Youtube_ApiUrl);
  private readonly apiUrl_Search = this.configService.get<string>(ENV_Youtube_Search);
  private readonly apiUrl_Channel = this.configService.get<string>(ENV_Youtube_Channel);


  // 동영상 정보 검색 (동영상 Id만 입력해서 검색)
  async getVideoDetails(videoId: string) {
    const url = `${this.apiUrl_Video}?part=snippet,contentDetails,statistics&id=${videoId}&key=${this.apiKey}`;

    const response = await axios.get(url);
    const videos = response.data.items;

    if (videos && videos.length === 0) {
      throw new NotFoundException('채널이 존재하지 않습니다.');
    }
    
    return videos;
  }

  // 채널 정보 검색 (channelId로만 검색이 가능)
  async getChannel(channelId: string, maxResults: number = 50) {
    const url = `${this.apiUrl_Search}?part=snippet&channelId=${channelId}&maxResults=${maxResults}&key=${this.apiKey}`;

    const response = await axios.get(url);
    const channels = response.data.items;

    if (channels && channels.length === 0) {
      throw new NotFoundException('채널이 존재하지 않습니다.');
    }

    return channels;
  }

  // 유튜브 검색
  async getSearch(title: string, maxResults: number = 50) {
    const encoded = encodeURIComponent(title);
    const url = `${this.apiUrl_Search}?part=snippet&q=${encoded}&maxResults=${maxResults}&key=${this.apiKey}`;

    const response = await axios.get(url);
    const searchs = response.data.items;

    if (searchs && searchs.length === 0) {
      throw new NotFoundException('채널이 존재하지 않습니다.');
    }

    return searchs;
  }

  // 채널이름 검색(@제외 채널이름 검색)
  async getChannelName(channelName: string) {
    const url = `${this.apiUrl_Channel}?part=snippet&forHandle=@${channelName}&key=${this.apiKey}`;

    const response = await axios.get(url);
    const channels = response.data.items;

    if (channels && channels.length === 0) {
      throw new NotFoundException('채널이 존재하지 않습니다.');
    }

    // const result = channels[0].snippet.title;
    
    return channels;
  }
}
