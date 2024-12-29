import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Posts } from '../entities/post.entity';
import { Repository } from 'typeorm';
import { PostLikes } from './entities/post-likes.entity';

@Injectable()
export class PostLikesService {
  constructor(
    @InjectRepository(Posts) private postsRepository : Repository<Posts>,
    @InjectRepository(PostLikes) private postLikesRepository : Repository<PostLikes> 
  ){}
  
  // 해당 게시글 좋아요 생성
  async create(postId : number, userId : number) {
    const findPostOne = await this.postsRepository.findOne({
      where : { id : postId },
      select : ['id']
    });
    
    if(!findPostOne){
      throw new NotFoundException("게시물이 존재하지 않습니다.");
    }

    const findData = await this.postLikesRepository.findOne({
      where : { postId, userId },
      select : ['id']
    });

    if(!findData){
      const create = this.postLikesRepository.create({
        postId,
        userId
      });
  
      await this.postLikesRepository.save(create);
  
      return { statusCode : 201, message : "성공적으로 게시물 좋아요가 생성되었습니다." };
    } else {
      await this.postLikesRepository.delete(findData.id);
      return { statusCode : 201, message : "성공적으로 게시물 좋아요가 삭제되었습니다." };
    }
  }

  // 해당 게시글 좋아요 목록 전체 조회
  async findAll(postId : number) {
    const findPostOne = await this.postsRepository.findOne({
      where : { id : postId },
      select : ['id']
    });
    
    if(!findPostOne){
      throw new NotFoundException("게시물이 존재하지 않습니다.");
    }

    const find = await this.postLikesRepository.find({
      where : { postId : postId },
      relations : { users : true },
      select : {
        id : true,
        createdAt : true,
        users : {
          id : true,
          nickname : true,
          image : true
        }
      }
    });

    if(find && find.length === 0){
      throw new NotFoundException("게시물 좋아요 목록들이 존재하지 않습니다.");
    }

    return { statusCode : 200, message : "성공적으로 게시물 좋아요 전체 조회가 완료되었습니다.", data : find };
  }

  // 해당 게시글 좋아요 수 카운트
  async findCount(postId : number) {
    const findPostOne = await this.postsRepository.findOne({
      where : { id : postId },
      select : ['id']
    });
    
    if(!findPostOne){
      throw new NotFoundException("게시물이 존재하지 않습니다.");
    }

    const findCount = await this.postLikesRepository.find({
      where : { postId },
      select : ['id']
    });

    if(findCount && findCount.length === 0){
      throw new NotFoundException("게시물 좋아요 목록들이 존재하지 않습니다.");
    }

    const length = findCount.length;

    return { total : length };
  }

  // 해당 게시글 좋아요 목록 상세 조회
  async findOne(postId : number, id : number) {
    const findPostOne = await this.postsRepository.findOne({
      where : { id : postId },
      select : ['id']
    });
    
    if(!findPostOne){
      throw new NotFoundException("게시물이 존재하지 않습니다.");
    }

    const findOne = await this.postLikesRepository.findOne({
      where : { postId, id },
      relations : { users : true },
      select : {
        id : true,
        createdAt : true,
        users : {
          id : true,
          nickname : true,
          image : true
        }
      }
    });

    if(!findOne){
      throw new NotFoundException("게시물 좋아요 목록이 존재하지 않습니다.");
    }
    
    return { statusCode : 200, message : "성공적으로 게시물 좋아요 상세 조회가 완료되었습니다.", data : findOne };
  }
}
