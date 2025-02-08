import { Test, TestingModule } from '@nestjs/testing';
import { AlbumCommentsService } from './album-comments.service';

describe('AlbumCommentsService', () => {
  let service: AlbumCommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlbumCommentsService],
    }).compile();

    service = module.get<AlbumCommentsService>(AlbumCommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
