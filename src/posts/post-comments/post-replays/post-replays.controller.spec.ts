import { Test, TestingModule } from '@nestjs/testing';
import { PostReplaysController } from './post-replays.controller';
import { PostReplaysService } from './post-replays.service';

describe('PostReplaysController', () => {
  let controller: PostReplaysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostReplaysController],
      providers: [PostReplaysService],
    }).compile();

    controller = module.get<PostReplaysController>(PostReplaysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
