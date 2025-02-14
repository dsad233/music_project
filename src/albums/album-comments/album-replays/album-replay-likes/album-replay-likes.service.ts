import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Albums } from 'src/albums/entities/album.entity';
import { AlbumComments } from '../../entities/album-comment.entity';
import { AlbumReplays } from '../entities/album-replay.entity';
import { Repository } from 'typeorm';
import { Cache,CACHE_MANAGER } from '@nestjs/cache-manager';
import { AlbumReplayLikes } from './entities/album-replay-like.entity';

@Injectable()
export class AlbumReplayLikesService {
  constructor(
    @InjectRepository(Albums) private readonly albumRepository : Repository<Albums>,
    @InjectRepository(AlbumComments) private albumCommentsRepository : Repository<AlbumComments>,
    @InjectRepository(AlbumReplays) private albumReplaysRepository : Repository<AlbumReplays>,
    @InjectRepository(AlbumReplayLikes) private albumReplayLikesRepository : Repository<AlbumReplayLikes>,
    @Inject(CACHE_MANAGER) private cacheManager : Cache
  )
  {}
  async create(albumId : number, albumCommentId : number, albumReplayId : number, userId : number) {
    const findPost = await this.albumRepository.findOne({
      where : { id : albumId, isOpen : true }
    });
    return ;
  }
}
