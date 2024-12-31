import { Test, TestingModule } from '@nestjs/testing';
import { PostReplaysService } from './post-replays.service';

describe('PostReplaysService', () => {
  let service: PostReplaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostReplaysService],
    }).compile();

    service = module.get<PostReplaysService>(PostReplaysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
