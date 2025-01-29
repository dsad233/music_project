import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Posts } from 'src/posts/entities/post.entity';
import { Repository } from 'typeorm';
import { PostComments } from '../entities/post-comments.entity';
import { PostCommentLikes } from './entities/post-comment-like.entity';

@Injectable()
export class PostCommentLikesService {
  constructor(
    @InjectRepository(Posts) private readonly postsRepository : Repository<Posts>,
    @InjectRepository(PostComments) private readonly postCommentsRepository : Repository<PostComments>,
    @InjectRepository(PostCommentLikes) private postCommentLikesRepository : Repository<PostCommentLikes>
  ){}

  // 해당 노래 목록 댓글에 좋아요 생성 및 삭제 
  async create(postId : number, postCommentId : number, userId : number) {
    const findPostOne = await this.postsRepository.findOne({
      where : { id : postId, isOpen : true },
      select : ['id']
    });

    if(!findPostOne){
      throw new NotFoundException("노래 목록이 존재하지 않습니다.");
    }

    const findCommentOne = await this.postCommentsRepository.findOne({
      where : { postId, id : postCommentId },
      select : ['id']
    });

    if(!findCommentOne){
      throw new NotFoundException("노래 댓글 목록이 존재하지 않습니다.");
    }

    const findCommentLike = await this.postCommentLikesRepository.findOne({
      where : { postId, postCommentId, userId },
      select : ['id']
    });

    if(!findCommentLike){
      const create = this.postCommentLikesRepository.create({
        userId,
        postId,
        postCommentId
      });
      
      await this.postCommentLikesRepository.save(create);

      return { statusCode : 201, message : "성공적으로 노래 댓글에 좋아요를 생성하였습니다." };
    } else {
      await this.postCommentLikesRepository.delete(findCommentLike.id);
      return { statusCode : 201, message : "성공적으로 노래 댓글에 좋아요를 삭제하였습니다." };
    }
  }

  // 해당 노래 목록 댓글 좋아요 전체 조회 
  async findAll(postId : number, postCommentId : number, page : number, page_size : number) {
    const findPostOne = await this.postsRepository.findOne({
      where : { id : postId, isOpen : true },
      select : ['id']
    });

    if(!findPostOne){
      throw new NotFoundException("노래 목록이 존재하지 않습니다.");
    }

    const findCommentOne = await this.postCommentsRepository.findOne({
      where : { postId, id : postCommentId },
      select : ['id']
    });

    if(!findCommentOne){
      throw new NotFoundException("노래 댓글 목록이 존재하지 않습니다.");
    }

    if(!page){
      page = 1;
    }

    if(!page_size){
      page_size = 10;
    }

    const findAll = await this.postCommentLikesRepository.find({
      where : { postId, postCommentId },
      relations : { users : true },
      select : {
        id : true,
        createdAt : true,
        users : {
          id : true,
          nickname : true,
          image : true
        }
      },
      skip : ((page - 1) * page_size),
      take : page_size
    });

    if(findAll && findAll.length === 0){
      throw new NotFoundException("노래 댓글 좋아요 목록들이 존재하지 않습니다.");
    }

    return { statusCode : 200, message : "성공적으로 노래 댓글 좋아요 전체 조회가 완료되었습니다.", data : findAll };
  }

  // 해당 노래 목록 댓글 좋아요 상세 조회
  async findOne(postId : number, postCommentId : number, id: number) {
    const findPostOne = await this.postsRepository.findOne({
      where : { id : postId, isOpen : true },
      select : ['id']
    });

    if(!findPostOne){
      throw new NotFoundException("노래 목록이 존재하지 않습니다.");
    }

    const findCommentOne = await this.postCommentsRepository.findOne({
      where : { postId, id : postCommentId },
      select : ['id']
    });

    if(!findCommentOne){
      throw new NotFoundException("노래 댓글 목록이 존재하지 않습니다.");
    }

    const findOne = await this.postCommentLikesRepository.findOne({
      where : { postId, postCommentId, id },
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
      throw new NotFoundException("노래 댓글 좋아요 목록이 존재하지 않습니다.");
    }

    return { statusCode : 200, message : "성공적으로 노래 댓글 좋아요 상세 조회가 완료되었습니다.", data : findOne };
  }
}
