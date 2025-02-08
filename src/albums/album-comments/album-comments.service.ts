import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAlbumCommentDto } from './dto/create-album-comment.dto';
import { UpdateAlbumCommentDto } from './dto/update-album-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Albums } from '../entities/album.entity';
import { AlbumComment } from './entities/album-comment.entity';

@Injectable()
export class AlbumCommentsService {
  constructor(
    @InjectRepository(Albums) private readonly albumRepository : Repository<Albums>,
    @InjectRepository(AlbumComment) private albumCommentsRepository : Repository<AlbumComment>,
  ){}
  // 해당 앨범 댓글 생성
  async create(albumId : number, userId : number, createAlbumCommentDto: CreateAlbumCommentDto) {
    const findAlbumOne = await this.albumRepository.findOne({
      where : { id : albumId },
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
  
    return { statusCode : 201, message : "성공적으로 앨범 댓글 생성이 완료되었습니다." };
  }

  // 해당 앨범 댓글 수정
  async update(albumId: number, id: number, userId : number, updateAlbumCommentDto: UpdateAlbumCommentDto) {
    const findAlbumOne = await this.albumRepository.findOne({
      where : { id : albumId },
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

    return { statusCode : 201, message : "성공적으로 앨범 댓글 수정이 완료되었습니다." };
  }

  // 해당 앨범 댓글 삭제
  async remove(id: number) {
    return `This action removes a #${id} albumComment`;
  }
}
