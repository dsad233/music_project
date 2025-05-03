import { Test, TestingModule } from '@nestjs/testing';
import { PostReplayLikesController } from './post-replay-likes.controller';
import { PostReplayLikesService } from './post-replay-likes.service';

describe('PostReplayLikesController', () => {
  let controller: PostReplayLikesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostReplayLikesController],
      providers: [PostReplayLikesService],
    }).compile();

    controller = module.get<PostReplayLikesController>(
      PostReplayLikesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
