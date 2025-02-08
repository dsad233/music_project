import { Test, TestingModule } from '@nestjs/testing';
import { AlbumCommentsController } from './album-comments.controller';
import { AlbumCommentsService } from './album-comments.service';

describe('AlbumCommentsController', () => {
  let controller: AlbumCommentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlbumCommentsController],
      providers: [AlbumCommentsService],
    }).compile();

    controller = module.get<AlbumCommentsController>(AlbumCommentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
