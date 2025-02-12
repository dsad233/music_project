import { Test, TestingModule } from '@nestjs/testing';
import { AlbumReplaysService } from './album-replays.service';

describe('AlbumReplaysService', () => {
  let service: AlbumReplaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlbumReplaysService],
    }).compile();

    service = module.get<AlbumReplaysService>(AlbumReplaysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
