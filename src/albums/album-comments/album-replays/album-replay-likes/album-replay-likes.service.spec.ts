import { Test, TestingModule } from '@nestjs/testing';
import { AlbumReplayLikesService } from './album-replay-likes.service';

describe('AlbumReplayLikesService', () => {
  let service: AlbumReplayLikesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlbumReplayLikesService],
    }).compile();

    service = module.get<AlbumReplayLikesService>(AlbumReplayLikesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
