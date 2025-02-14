import { Test, TestingModule } from '@nestjs/testing';
import { AlbumReplayLikesController } from './album-replay-likes.controller';
import { AlbumReplayLikesService } from './album-replay-likes.service';

describe('AlbumReplayLikesController', () => {
  let controller: AlbumReplayLikesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlbumReplayLikesController],
      providers: [AlbumReplayLikesService],
    }).compile();

    controller = module.get<AlbumReplayLikesController>(AlbumReplayLikesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
