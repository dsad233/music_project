import { Test, TestingModule } from '@nestjs/testing';
import { PostCommentLikesService } from './post-comment-likes.service';

describe('PostCommentLikesService', () => {
  let service: PostCommentLikesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostCommentLikesService],
    }).compile();

    service = module.get<PostCommentLikesService>(PostCommentLikesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
