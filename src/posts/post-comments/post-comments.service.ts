import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostCommentDto } from './dto/create-post-comment.dto';
import { UpdatePostCommentDto } from './dto/update-post-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PostComments } from './entities/post-comments.entity';
import { Repository } from 'typeorm';
import { Posts } from '../entities/post.entity';

@Injectable()
export class PostCommentsService {
  constructor( 
    @InjectRepository(Posts) private postsRepository : Repository<Posts>,
    @InjectRepository(PostComments) private postCommentsRepository : Repository<PostComments>
  ){}

  // 게시글 댓글 생성
  async create(postId : number, userId : number, createPostCommentDto : CreatePostCommentDto) {
    const findPostOne = await this.postsRepository.findOne({ where : { id : postId } });

    if(!findPostOne){
      throw new NotFoundException("게시글이 존재하지 않습니다.");
    }
    
    const { context } = createPostCommentDto;

    const createPostComment = this.postCommentsRepository.create({
      postId : postId,
      userId : userId,
      context : context
    });

    await this.postCommentsRepository.save(createPostComment);
    
    return { statusCode : 201, message : "성공적으로 게시글 댓글 생성이 완료되었습니다." };
  }

  // 게시글 댓글 전체 조회
  async findAll(postId : number) {
    const findPostOne = await this.postsRepository.findOne({ 
      where : { id : postId }, 
      select : ['id'] 
    });

    if(!findPostOne){
      throw new NotFoundException("게시글이 존재하지 않습니다.");
    }

    const find = await this.postCommentsRepository.find({
      where : { postId : postId, deletedAt : null },
      relations : { users : true },
      select : {
        id : true,
        context : true,
        createdAt : true,
        updatedAt : true,
        users : {
          id : true,
          nickname : true,
          image : true
        },
      }, 
    });
    
    if(find && find.length === 0){
      throw new NotFoundException("게시글 댓글들이 존재하지 않습니다.");
    }
    
    return { statusCode : 200, message : "성공적으로 게시물 댓글 전체 조회가 완료되었습니다.", data : find };
  }

  // 게시글 댓글 상세 조회
  async findOne(postId: number, id : number) {
    const findPostOne = await this.postsRepository.findOne({ 
      where : { id : postId }, 
      select : ['id'] 
    });

    if(!findPostOne){
      throw new NotFoundException("게시글이 존재하지 않습니다.");
    }

    const findOne = await this.postCommentsRepository.findOne({
      where : { id, deletedAt : null },
      relations : { users : true },
      select : {
        id : true,
        context : true,
        createdAt : true,
        updatedAt : true,
        users : {
          id : true,
          nickname : true,
          image : true
        },
      },
    });

    if(!findOne){
      throw new NotFoundException("게시글 댓글이 존재하지 않습니다.");
    }

    return { statusCode : 200, message : "성공적으로 게시물 댓글 상세 조회가 완료되었습니다.", data : findOne };
  }

  // 게시글 댓글 수정
  async update(postId : number, id: number, updatePostCommentDto: UpdatePostCommentDto) {
    const findPostOne = await this.postCommentsRepository.findOne({
      where : { id : postId, deletedAt : null },
      select : ['id']
    });

    if(!findPostOne){
      throw new NotFoundException("게시글이 존재하지 않습니다.");
    }

    const { context } = updatePostCommentDto;

    await this.postCommentsRepository.update(id, {
      context : context
    });

    return { statusCode : 201, message : "성공적으로 게시물 댓글 수정이 완료되었습니다." };
  }

  remove(id: number) {
    return `This action removes a #${id} postComment`;
  }
}
