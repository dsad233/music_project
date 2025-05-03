import { Injectable, NotFoundException } from '@nestjs/common';
// import { CreateYoutubeServiceDto } from './dto/create-youtube-service.dto';
// import { UpdateYoutubeServiceDto } from './dto/update-youtube-service.dto';
import { ConfigService } from '@nestjs/config';
import {
  ENV_Youtube_ApiKey,
  ENV_Youtube_ApiUrl,
  ENV_Youtube_Channel,
  ENV_Youtube_Search,
} from 'src/utils/const/keys';
import puppeteer from 'puppeteer';
// import {  } from "cheerio";

@Injectable()
export class YoutubeServiceService {
  constructor(private readonly configService: ConfigService) {}
  // private readonly apiKey = this.configService.get<string>(ENV_Youtube_ApiKey);
  // private readonly apiUrl_Video = this.configService.get<string>(ENV_Youtube_ApiUrl);
  // private readonly apiUrl_Search = this.configService.get<string>(ENV_Youtube_Search);
  // private readonly apiUrl_Channel = this.configService.get<string>(ENV_Youtube_Channel);

  // 유튜브 검색(크롤링)
  async searchMusicVideos(query: string) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const record = encodeURIComponent(query);

    const searchUrl = `https://www.youtube.com/results?search_query=${record}+music+video`;
    await page.goto(searchUrl);

    await page.waitForSelector('h3 > a');
    await page.screenshot({ path: 'screenshot.png', fullPage: false });

    const videos = await page.evaluate(() => {
      const videoElements = Array.from(
        document.querySelectorAll('ytd-video-renderer'),
      );
      return videoElements.map((video) => {
        const titleElement = video.querySelector('#video-title');
        const url = titleElement
          ? `https://www.youtube.com${titleElement.getAttribute('href')}`
          : '';
        const title = titleElement ? titleElement.textContent.trim() : '';

        return { title, url };
      });
    });

    await browser.close();

    if (videos.length === 0) {
      throw new NotFoundException('영상이 존재하지 않습니다.');
    }

    return videos;
  }

  // 유튜브 상세 목록(크롤링)
  async searchVideoOne(query: string) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const record = encodeURIComponent(query);

    const searchUrl = `https://www.youtube.com/watch?v=${record}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    await page.waitForSelector(
      '#movie_player > div.html5-video-container > video',
    );
    await page.screenshot({ path: 'screenshot.png', fullPage: false });

    console.log(page);

    const videos = await page.evaluate(() => {
      const videoElements = Array.from(
        document.querySelectorAll('#primary-inner'),
      );
      return videoElements.map((video) => {
        const title = video
          .querySelector('#title > h1 > yt-formatted-string')
          .textContent.trim();
        const tagName = video.querySelector('#text > a').textContent.trim();
        const videoInfo = video
          .querySelector('#attributed-snippet-text > span > span')
          .textContent.trim();
        const createDate = video
          .querySelector('#info > span:nth-child(3)')
          .textContent.trim();
        const count = video
          .querySelector('#info > span:nth-child(1)')
          .textContent.trim();
        const url = window.location.href;

        return { title, url, tagName, createDate, count, videoInfo };
      });
    });

    await browser.close();

    if (videos.length === 0) {
      throw new NotFoundException('영상이 존재하지 않습니다.');
    }

    return videos;
  }
}
