import { Test, TestingModule } from '@nestjs/testing';
import { PostReplayLikesService } from './post-replay-likes.service';

describe('PostReplayLikesService', () => {
  let service: PostReplayLikesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostReplayLikesService],
    }).compile();

    service = module.get<PostReplayLikesService>(PostReplayLikesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
