import { Test, TestingModule } from '@nestjs/testing';
import { PostCommentLikesController } from './post-comment-likes.controller';
import { PostCommentLikesService } from './post-comment-likes.service';

describe('PostCommentLikesController', () => {
  let controller: PostCommentLikesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostCommentLikesController],
      providers: [PostCommentLikesService],
    }).compile();

    controller = module.get<PostCommentLikesController>(
      PostCommentLikesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
