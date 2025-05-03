import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Albums } from '../entities/album.entity';
import { Repository } from 'typeorm';
import { AlbumLikes } from './entities/album-like.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AlbumLikesService {
  constructor(
    @InjectRepository(Albums)
    private readonly albumRepository: Repository<Albums>,
    @InjectRepository(AlbumLikes)
    private albumLikesRepository: Repository<AlbumLikes>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // 해당 앨범 좋아요 생성 및 삭제
  async create(albumId: number, userId: number) {
    const findOne = await this.albumRepository.findOne({
      where: { id: albumId, isOpen: true },
      select: ['id'],
    });

    if (!findOne) {
      throw new NotFoundException('앨범 목록이 존재하지 않습니다.');
    }

    const findAlbumLike = await this.albumLikesRepository.findOne({
      where: { albumId, userId },
      select: ['id'],
    });

    if (!findAlbumLike) {
      const create = this.albumLikesRepository.create({
        albumId,
        userId,
      });

      await this.albumLikesRepository.save(create);

      const cached = await this.cacheManager.get(`album:${albumId}`);

      if (cached) {
        await this.cacheManager.del(`album:${albumId}`);
      }

      return {
        statusCode: 201,
        message: '성공적으로 앨범 목록 좋아요가 생성되었습니다.',
      };
    } else {
      await this.albumLikesRepository.delete(findAlbumLike.id);

      const cached = await this.cacheManager.get(`album:${albumId}`);

      if (cached) {
        await this.cacheManager.del(`album:${albumId}`);
      }

      return {
        statusCode: 201,
        message: '성공적으로 앨범 목록 좋아요가 삭제되었습니다.',
      };
    }
  }
}
