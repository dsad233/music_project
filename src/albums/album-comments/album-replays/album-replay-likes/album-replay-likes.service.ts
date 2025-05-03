import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Albums } from 'src/albums/entities/album.entity';
import { AlbumComments } from '../../entities/album-comment.entity';
import { AlbumReplays } from '../entities/album-replay.entity';
import { Repository } from 'typeorm';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { AlbumReplayLikes } from './entities/album-replay-like.entity';

@Injectable()
export class AlbumReplayLikesService {
  constructor(
    @InjectRepository(Albums)
    private readonly albumRepository: Repository<Albums>,
    @InjectRepository(AlbumComments)
    private albumCommentsRepository: Repository<AlbumComments>,
    @InjectRepository(AlbumReplays)
    private albumReplaysRepository: Repository<AlbumReplays>,
    @InjectRepository(AlbumReplayLikes)
    private albumReplayLikesRepository: Repository<AlbumReplayLikes>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // 해당 앨범 대댓글 좋아요 생성 및 삭제
  async create(
    albumId: number,
    albumCommentId: number,
    albumReplayId: number,
    userId: number,
  ) {
    const findAlbum = await this.albumRepository.findOne({
      where: { id: albumId, isOpen: true },
      select: ['id'],
    });

    if (!findAlbum) {
      throw new NotFoundException('앨범 목록이 존재하지 않습니다.');
    }

    const findAlbumComment = await this.albumCommentsRepository.findOne({
      where: { albumId, id: albumCommentId },
      select: ['id'],
    });

    if (!findAlbumComment) {
      throw new NotFoundException('앨범 댓글 목록이 존재하지 않습니다.');
    }

    const findAlbumReplay = await this.albumReplaysRepository.findOne({
      where: { albumId, albumCommentId, id: albumReplayId },
      select: ['id'],
    });

    if (!findAlbumReplay) {
      throw new NotFoundException('앨범 대댓글 목록이 존재하지 않습니다.');
    }

    const findAlbumReplayLike = await this.albumReplayLikesRepository.findOne({
      where: { albumId, albumCommentId, albumReplayId, userId },
    });

    if (!findAlbumReplayLike) {
      const create = this.albumReplayLikesRepository.create({
        userId,
        albumId,
        albumCommentId,
        albumReplayId,
      });

      await this.albumReplayLikesRepository.save(create);

      const cached = await this.cacheManager.get(`album:${albumId}`);

      if (cached) {
        await this.cacheManager.del(`album:${albumId}`);
      }

      return {
        statusCode: 201,
        message: '성공적으로 앨범 대댓글 좋아요를 생성하였습니다.',
      };
    } else {
      await this.albumReplayLikesRepository.delete(findAlbumReplayLike.id);

      const cached = await this.cacheManager.get(`album:${albumId}`);

      if (cached) {
        await this.cacheManager.del(`album:${albumId}`);
      }

      return {
        statusCode: 201,
        message: '성공적으로 앨범 대댓글 좋아요를 삭제하였습니다.',
      };
    }
  }
}
