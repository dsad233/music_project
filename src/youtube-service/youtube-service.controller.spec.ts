import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeServiceController } from './youtube-service.controller';
import { YoutubeServiceService } from './youtube-service.service';

describe('YoutubeServiceController', () => {
  let controller: YoutubeServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YoutubeServiceController],
      providers: [YoutubeServiceService],
    }).compile();

    controller = module.get<YoutubeServiceController>(YoutubeServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
