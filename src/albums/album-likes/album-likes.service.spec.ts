import { Test, TestingModule } from '@nestjs/testing';
import { AlbumLikesService } from './album-likes.service';

describe('AlbumLikesService', () => {
  let service: AlbumLikesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlbumLikesService],
    }).compile();

    service = module.get<AlbumLikesService>(AlbumLikesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
