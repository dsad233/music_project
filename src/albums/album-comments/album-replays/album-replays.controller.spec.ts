import { Test, TestingModule } from '@nestjs/testing';
import { AlbumReplaysController } from './album-replays.controller';
import { AlbumReplaysService } from './album-replays.service';

describe('AlbumReplaysController', () => {
  let controller: AlbumReplaysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlbumReplaysController],
      providers: [AlbumReplaysService],
    }).compile();

    controller = module.get<AlbumReplaysController>(AlbumReplaysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
