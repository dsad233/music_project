import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAlbumCommentDto } from './dto/create-album-comment.dto';
import { UpdateAlbumCommentDto } from './dto/update-album-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Albums } from '../entities/album.entity';
import { AlbumComments } from './entities/album-comment.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AlbumCommentsService {
  constructor(
    @InjectRepository(Albums) private readonly albumRepository : Repository<Albums>,
    @InjectRepository(AlbumComments) private albumCommentsRepository : Repository<AlbumComments>,
    @Inject(CACHE_MANAGER) private cacheManager : Cache
  ){}
  // 해당 앨범 댓글 생성
  async create(albumId : number, userId : number, createAlbumCommentDto : CreateAlbumCommentDto) {
    const findAlbumOne = await this.albumRepository.findOne({
      where : { id : albumId, isOpen : true },
      select : ['id']
    }); 

    if(!findAlbumOne){
      throw new NotFoundException("앨범 목록이 존재하지 않습니다.");
    }

    const { context } = createAlbumCommentDto;
    
    const createAlbumComment = this.albumCommentsRepository.create({
      userId,
      albumId,
      context
    });

    await this.albumCommentsRepository.save(createAlbumComment);

    const cached = await this.cacheManager.get(`album:${albumId}`);

    if(cached){
      await this.cacheManager.del(`album:${albumId}`);
    }
  
    return { statusCode : 201, message : "성공적으로 앨범 댓글 생성이 완료되었습니다." };
  }

  // 해당 앨범 댓글 삭제리스트 조회
  async findDeleteList(page : number, page_size : number) {
    if(!page){
      page = 1;
    }

    if(!page_size){
      page_size = 10;
    }

    const offset = ((page - 1) * page_size);

    const [findDeleted, total] = await this.albumCommentsRepository.createQueryBuilder('album_comments')
    .withDeleted()
    .where('album_comments.deletedAt IS NOT NULL')
    .innerJoin('album_comments.users', 'users')
    .innerJoin('users.userInfos', 'userInfos')
    .select([
      'album_comments.id',
      'album_comments.context',
      'album_comments.createdAt',
      'album_comments.updatedAt',
      'album_comments.deletedAt',
      'users.id',
      'users.nickname',
      'userInfos.image'
    ])
    .skip(offset)
    .take(page_size)
    .getManyAndCount()

    if(findDeleted && findDeleted.length === 0){
      throw new NotFoundException("삭제 신청된 앨범 댓글 목록들이 존재하지 않습니다.");
    }

    const pageRange = Math.ceil(total / page_size);
    
    return { statusCode : 200, message : "성공적으로 삭제 예정된 앨범 댓글 전체 조회가 완료되었습니다.", total : total, pageRange : pageRange, data : findDeleted };
  }

  // 해당 앨범 댓글 수정
  async update(albumId : number, id : number, userId : number, updateAlbumCommentDto : UpdateAlbumCommentDto) {
    const findAlbumOne = await this.albumRepository.findOne({
      where : { id : albumId, isOpen : true },
      select : ['id']
    }); 

    if(!findAlbumOne){
      throw new NotFoundException("앨범 목록이 존재하지 않습니다.");
    }

    const findOne = await this.albumCommentsRepository.findOne({
      where : { id, albumId },
      select : ['id', 'userId']
    });

    if(!findOne){
      throw new NotFoundException("앨범 댓글 목록이 존재하지 않습니다.");
    }

    if(findOne.userId !== userId){
      throw new UnauthorizedException("유저 정보가 일치하지 않아 수정이 불가능합니다.");
    }

    const { context } = updateAlbumCommentDto;

    await this.albumCommentsRepository.update(id, {
      context
    });

    const cached = await this.cacheManager.get(`album:${albumId}`);

    if(cached){
      await this.cacheManager.del(`album:${albumId}`);
    }

    return { statusCode : 201, message : "성공적으로 앨범 댓글 수정이 완료되었습니다." };
  }

  // 해당 앨범 댓글 삭제
  async remove(albumId : number, id : number) {
    const findAlbumOne = await this.albumRepository.findOne({
      where : { id : albumId },
      select : ['id']
    }); 

    if(!findAlbumOne){
      throw new NotFoundException("앨범 목록이 존재하지 않습니다.");
    }

    const findOne = await this.albumCommentsRepository.findOne({
      where : { id, albumId },
      select : ['id']
    });

    if(!findOne){
      throw new NotFoundException("앨범 댓글 목록이 존재하지 않습니다.");
    }

    await this.albumCommentsRepository.delete(id);

    const cached = await this.cacheManager.get(`album:${albumId}`);

    if(cached){
      await this.cacheManager.del(`album:${albumId}`);
    }
    
    return { statusCode : 201, message : "성공적으로 앨범 댓글 삭제가 완료되었습니다." };
  }


  // 해당 앨범 댓글 임시 삭제
  async softDelete(albumId : number, id : number, userId : number){
    const findAlbumOne = await this.albumRepository.findOne({
      where : { id : albumId, isOpen : true },
      select : ['id']
    }); 

    if(!findAlbumOne){
      throw new NotFoundException("앨범 목록이 존재하지 않습니다.");
    }

    const findOne = await this.albumCommentsRepository.findOne({
      where : { id, albumId },
      select : ['id', 'userId']
    });

    if(!findOne){
      throw new NotFoundException("앨범 댓글 목록이 존재하지 않습니다.");
    }

    if(findOne.userId !== userId){
      throw new UnauthorizedException("유저 정보가 일치하지 않아 수정이 불가능합니다.");
    }

    await this.albumCommentsRepository.update(id, {
      deletedAt : new Date()
    });

    const cached = await this.cacheManager.get(`album:${albumId}`);

    if(cached){
      await this.cacheManager.del(`album:${albumId}`);
    }

    return { statusCode : 201, message : "성공적으로 앨범 댓글 삭제가 완료되었습니다." };
  }
}
