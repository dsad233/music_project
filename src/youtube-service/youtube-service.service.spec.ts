import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeServiceService } from './youtube-service.service';

describe('YoutubeServiceService', () => {
  let service: YoutubeServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YoutubeServiceService],
    }).compile();

    service = module.get<YoutubeServiceService>(YoutubeServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
