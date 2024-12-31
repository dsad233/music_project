import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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

  // 해당 게시물 댓글 생성
  async create(postId : number, userId : number, createPostCommentDto : CreatePostCommentDto) {
    const findPostOne = await this.postsRepository.findOne({ 
      where : { id : postId },
      select : ['id']  
    });

    if(!findPostOne){
      throw new NotFoundException("노래 목록이 존재하지 않습니다.");
    }
    
    const { context } = createPostCommentDto;

    const createPostComment = this.postCommentsRepository.create({
      postId : postId,
      userId : userId,
      context : context
    });

    await this.postCommentsRepository.save(createPostComment);
    
    return { statusCode : 201, message : "성공적으로 노래 댓글 생성이 완료되었습니다." };
  }

  // 해당 게시물 댓글 전체 조회
  async findAll(postId : number) {
    const findPostOne = await this.postsRepository.findOne({ 
      where : { id : postId }, 
      select : ['id'] 
    });

    if(!findPostOne){
      throw new NotFoundException("노래 목록이 존재하지 않습니다.");
    }

    const find = await this.postCommentsRepository.find({
      where : { postId : postId },
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
      throw new NotFoundException("노래 댓글 목록들이 존재하지 않습니다.");
    }
    
    return { statusCode : 200, message : "성공적으로 노래 댓글 전체 조회가 완료되었습니다.", data : find };
  }

  // 해당 게시물 댓글 삭제 리스트 전체 조회 (어드민만 가능)
  async findDeletedList() {
    const findComment = await this.postCommentsRepository.createQueryBuilder("post-comments")
    .withDeleted()
    .where('post-comments.deletedAt IS NOT NULL')
    .innerJoin('post-comments.users', 'users')
    .select([
      'post-comments.id',
      'post-comments.context',
      'post-comments.createdAt',
      'post-comments.updatedAt',
      'post-comments.deletedAt',
      'users.id',
      'users.nickname',
      'users.image'
    ])
    .getMany();

    if(findComment && findComment.length === 0){
      throw new NotFoundException("삭제 신청된 노래 댓글들이 존재하지 않습니다.");
    }

    return { statusCode : 200, message : "성공적으로 삭제 예정된 노래 댓글 전체 조회가 완료되었습니다.", data : findComment };
  }

  // 해당 게시물 댓글 상세 조회
  async findOne(postId: number, id : number) {
    const findPostOne = await this.postsRepository.findOne({ 
      where : { id : postId }, 
      select : ['id'] 
    });

    if(!findPostOne){
      throw new NotFoundException("노래 목록이 존재하지 않습니다.");
    }

    const findOne = await this.postCommentsRepository.findOne({
      where : { id },
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
      throw new NotFoundException("노래 댓글 목록이 존재하지 않습니다.");
    }

    return { statusCode : 200, message : "성공적으로 노래 댓글 상세 조회가 완료되었습니다.", data : findOne };
  }

  // 해당 게시물 댓글 수정
  async update(userId : number, postId : number, id: number, updatePostCommentDto: UpdatePostCommentDto) {
    const findPostOne = await this.postCommentsRepository.findOne({
      where : { id : postId },
      select : ['id']
    });

    if(!findPostOne){
      throw new NotFoundException("노래 목록이 존재하지 않습니다.");
    }

    if(findPostOne.userId !== userId){
      throw new UnauthorizedException("유저 정보가 일치하지 않아 수정이 불가능합니다.")
    }

    const { context } = updatePostCommentDto;

    await this.postCommentsRepository.update(id, {
      context
    });

    return { statusCode : 201, message : "성공적으로 노래 댓글 수정이 완료되었습니다." };
  }

  // 해당 게시물 댓글 삭제
  async remove(postId : number, id: number) {
    const findPostOne = await this.postsRepository.findOne({
      where : { id : postId },
      withDeleted : true,
      select : ['id']
    });
    
    if(!findPostOne){
      throw new NotFoundException("노래 목록이 존재하지 않습니다.");
    }

    await this.postCommentsRepository.delete(id);

    return { statusCode : 201, message : "성공적으로 노래 댓글 삭제가 완료되었습니다." };
  }
  
  // 해당 게시물 댓글 임시 삭제 (회원만 가능)
  async softDelete(postId : number, id : number, userId : number) {
    const findPostOne = await this.postsRepository.findOne({
      where : { id : postId },
      select : ['id', 'userId']
    });

    if(!findPostOne){
      throw new NotFoundException("노래 목록이 존재하지 않습니다.");
    }

    if(findPostOne.userId !== userId){
      throw new UnauthorizedException("유저 정보가 일치하지 않아 삭제가 불가능합니다.");
    }

    await this.postCommentsRepository.update(id, {
      deletedAt : new Date()
    });

    return { statusCode : 201, message : "성공적으로 노래 댓글 삭제가 완료되었습니다." };
  }
}
