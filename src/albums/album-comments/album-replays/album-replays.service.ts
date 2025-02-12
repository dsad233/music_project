import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAlbumReplayDto } from './dto/create-album-replay.dto';
import { UpdateAlbumReplayDto } from './dto/update-album-replay.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Albums } from 'src/albums/entities/album.entity';
import { AlbumComments } from '../entities/album-comment.entity';
import { AlbumReplays } from './entities/album-replay.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AlbumReplaysService {
  constructor(
    @InjectRepository(Albums) private readonly albumRepository : Repository<Albums>,
    @InjectRepository(AlbumComments) private albumCommentsRepository : Repository<AlbumComments>,
    @InjectRepository(AlbumReplays) private albumReplaysRepository : Repository<AlbumReplays>,
    @Inject(CACHE_MANAGER) private cacheManager : Cache
  ){}

  // 해당 앨범 대댓글 생성
  async create(albumId : number, albumCommentId : number, createAlbumReplayDto: CreateAlbumReplayDto, userId : number) {
    console.log(albumId);
    console.log(albumCommentId);
    console.log(createAlbumReplayDto);
    console.log(userId);
    const findAlbum = await this.albumRepository.findOne({
      where : { id : albumId },
      select : ['id']
    });

    if(!findAlbum){
      throw new NotFoundException("앨범 목록이 존재하지 않습니다.");
    }

    const findAlbumComment = await this.albumCommentsRepository.findOne({
      where : { id : albumCommentId, albumId },
      select : ['id']
    });

    if(!findAlbumComment){
      throw new NotFoundException("앨범 댓글 목록이 존재하지 않습니다.");
    }

    const { context } = createAlbumReplayDto;

    const create = this.albumReplaysRepository.create({
      userId,
      albumId,
      albumCommentId : albumCommentId,
      context
    });

    await this.albumReplaysRepository.save(create);

    const cached = await this.cacheManager.get(`album:${albumId}`);

    if(cached){
      await this.cacheManager.del(`album:${albumId}`);
    }

    return { statusCode : 201, message : "성공적으로 앨범 대댓글 생성이 완료되었습니다." };
  }

  // 해당 앨범 대댓글 삭제리스트 전체 조회 (어드민만)
  async findDeleteList(page : number, page_size : number) {
    if(!page){
      page = 1;
    }

    if(!page_size){
      page_size = 10;
    }

    const offset = ((page - 1) * page_size);

    const [findDeleted, total] = await this.albumReplaysRepository.createQueryBuilder('album_replays')
    .withDeleted()
    .where('album_replays.deletedAt IS NOT NULL')
    .innerJoin('album_replays.users', 'users')
    .innerJoin('users.userInfos', 'userInfos')
    .select([
      'album_replays.id',
      'album_replays.context',
      'album_replays.createdAt',
      'album_replays.updatedAt',
      'album_replays.deletedAt',
      'users.id',
      'users.nickname',
      'userInfos.image'
    ])
    .skip(offset)
    .take(page_size)
    .getManyAndCount();

    if(findDeleted && findDeleted.length === 0){
      throw new NotFoundException("삭제 신청된 앨범 대댓글 목록들이 존재하지 않습니다.");
    }

    const pageRange = Math.floor(total / page_size);
    
    return { statusCode : 200, message : "성공적으로 삭제 예정된 앨범 대댓글 전체 조회가 완료되었습니다.", total : total, pageRange : pageRange, data : findDeleted };
  }

  // 해당 앨범 대댓글 수정
  async update(albumId : number, albumCommentId : number, id : number, updateAlbumReplayDto : UpdateAlbumReplayDto, userId : number) {
    const findAlbum = await this.albumRepository.findOne({
      where : { id : albumId },
      select : ['id']
    });

    if(!findAlbum){
      throw new NotFoundException("앨범 목록이 존재하지 않습니다.");
    }

    const findAlbumComment = await this.albumCommentsRepository.findOne({
      where : { id : albumCommentId, albumId },
      select : ['id']
    });

    if(!findAlbumComment){
      throw new NotFoundException("앨범 댓글 목록이 존재하지 않습니다.");
    }

    const findReplayOne = await this.albumReplaysRepository.findOne({
      where : { albumId, albumCommentId, id },
      select : ['id', 'userId']
    });

    if(!findReplayOne){
      throw new NotFoundException("앨범 대댓글 목록이 존재하지 않습니다.");
    }

    if(findReplayOne.userId !== userId){
      throw new UnauthorizedException("유저 정보가 일치하지 않아 수정이 불가능합니다.");
    }

    const { context } = updateAlbumReplayDto;
    
    await this.albumReplaysRepository.update(id, {
      context
    });

    const cached = await this.cacheManager.get(`album:${albumId}`);

    if(cached){
      await this.cacheManager.del(`album:${albumId}`);
    }
    
    return { statusCode : 201, message : "성공적으로 앨범 대댓글 수정이 완료되었습니다." };
  }

  // 해당 앨범 대댓글 삭제
  async remove(albumId : number, albumCommentId : number, id : number) {
    const findAlbum = await this.albumRepository.findOne({
      where : { id : albumId },
      select : ['id']
    });

    if(!findAlbum){
      throw new NotFoundException("앨범 목록이 존재하지 않습니다.");
    }

    const findAlbumComment = await this.albumCommentsRepository.findOne({
      where : { id : albumCommentId, albumId },
      select : ['id']
    });

    if(!findAlbumComment){
      throw new NotFoundException("앨범 댓글 목록이 존재하지 않습니다.");
    }

    const findReplayOne = await this.albumReplaysRepository.findOne({
      where : { albumId, albumCommentId, id },
      select : ['id']
    });

    if(!findReplayOne){
      throw new NotFoundException("앨범 대댓글 목록이 존재하지 않습니다.");
    }

    await this.albumReplaysRepository.delete(id);

    const cached = await this.cacheManager.get(`album:${albumId}`);

    if(cached){
      await this.cacheManager.del(`album:${albumId}`);
    }

    return { statusCode : 201, message : "성공적으로 앨범 대댓글 삭제가 완료되었습니다." };
  }

  // 해당 앨범 대댓글 임시 삭제
  async softDelete(albumId : number, albumCommentId : number, id : number, userId : number) {
    const findAlbum = await this.albumRepository.findOne({
      where : { id : albumId },
      select : ['id']
    });

    if(!findAlbum){
      throw new NotFoundException("앨범 목록이 존재하지 않습니다.");
    }

    const findAlbumComment = await this.albumCommentsRepository.findOne({
      where : { id : albumCommentId, albumId },
      select : ['id']
    });

    if(!findAlbumComment){
      throw new NotFoundException("앨범 댓글 목록이 존재하지 않습니다.");
    }

    const findReplayOne = await this.albumReplaysRepository.findOne({
      where : { albumId, albumCommentId, id },
      select : ['id', 'userId']
    });

    if(!findReplayOne){
      throw new NotFoundException("앨범 대댓글 목록이 존재하지 않습니다.");
    }

    if(findReplayOne.userId !== userId){
      throw new UnauthorizedException("유저 정보가 일치하지 않아 삭제가 불가능합니다.");
    }

    await this.albumReplaysRepository.update(id, {
      deletedAt : new Date()
    });

    const cached = await this.cacheManager.get(`album:${albumId}`);

    if(cached){
      await this.cacheManager.del(`album:${albumId}`);
    }

    return { statusCode : 201, message : "성공적으로 앨범 대댓글 삭제가 완료되었습니다." };
  } 
}
