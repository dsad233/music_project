import { Test, TestingModule } from '@nestjs/testing';
import { AlbumLikesController } from './album-likes.controller';
import { AlbumLikesService } from './album-likes.service';

describe('AlbumLikesController', () => {
  let controller: AlbumLikesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlbumLikesController],
      providers: [AlbumLikesService],
    }).compile();

    controller = module.get<AlbumLikesController>(AlbumLikesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
