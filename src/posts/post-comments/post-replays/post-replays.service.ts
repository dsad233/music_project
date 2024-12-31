import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostReplayDto } from './dto/create-post-replay.dto';
import { UpdatePostReplayDto } from './dto/update-post-replay.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PostReplays } from './entities/post-replay.entity';
import { Repository } from 'typeorm';
import { Posts } from 'src/posts/entities/post.entity';
import { PostComments } from '../entities/post-comments.entity';

@Injectable()
export class PostReplaysService {
  constructor(
    @InjectRepository(Posts) private postsRepository : Repository<Posts>,
    @InjectRepository(PostComments) private postCommentsRepository : Repository<PostComments>,
    @InjectRepository(PostReplays) private postReplaysRepository : Repository<PostReplays>
  ){}

  // 노래 대댓글 생성
  async create(userId : number, postId : number, postcommentId : number, createPostReplayDto: CreatePostReplayDto) {
    const findPostData = await this.postsRepository.findOne({
      where : { id : postId, isOpen : true },
      select : ['id']
    });

    if(!findPostData){
      throw new NotFoundException("노래 목록이 존재하지 않습니다.");
    }

    const findCommentDate = await this.postCommentsRepository.findOne({
      where : { id : postcommentId },
      select : ['id']
    });

    if(!findCommentDate){
      throw new NotFoundException("노래 댓글이 존재하지 않습니다.");
    }

    const { context } = createPostReplayDto;

    const create = this.postReplaysRepository.create({
      userId : userId,
      postId : postId,
      postcommentId : postcommentId,
      context
    });

    await this.postReplaysRepository.save(create);
    
    return { statusCode : 201, message : "성공적으로 노래 대댓글 작성을 완료하였습니다." };
  }

  // 해당 노래 대댓글 전체 조회
  async findAll(postId : number, postcommentId : number) {
    const findPostData = await this.postsRepository.findOne({
      where : { id : postId, isOpen : true },
      select : ['id']
    });

    if(!findPostData){
      throw new NotFoundException("노래 목록이 존재하지 않습니다.");
    }

    const findCommentDate = await this.postCommentsRepository.findOne({
      where : { id : postcommentId },
      select : ['id']
    });

    if(!findCommentDate){
      throw new NotFoundException("노래 댓글 목록이 존재하지 않습니다.");
    }

    const findReplayData = await this.postReplaysRepository.find({
      where : { postId : postId, postcommentId : postcommentId },
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
        }
      }
    });

    if(findReplayData && findReplayData.length === 0){
      throw new NotFoundException("노래 대댓글 목록들이 존재하지 않습니다.");
    }

    return { statusCode : 200, message : "성공적으로 노래 대댓글 전체 조회가 완료되었습니다.", data : findReplayData };
  }

  // 해당 게시물 대댓글 삭제 리스트 전체 조회 (어드민만 가능)
  async deletedList() {
    const findDeletedReplayData = await this.postReplaysRepository.createQueryBuilder('post-replays')
    .withDeleted()
    .where('post-replays.deletedAt IS NOT NULL')
    .innerJoin('post-replays.users', 'users')
    .select([
      'post-replays.id',
      'post-replays.context',
      'post-replays.createdAt',
      'post-replays.updatedAt',
      'post-replays.deletedAt',
      'users.id',
      'users.nickname',
      'users.image'
    ])
    .getMany()

    if(findDeletedReplayData && findDeletedReplayData.length === 0){
      throw new NotFoundException("삭제 신청된 노래 대댓글 목록들이 존재하지 않습니다.");
    }
    
    return { statusCode : 200, message : "성공적으로 삭제 예정된 노래 대댓글 전체 조회가 완료되었습니다.", data : findDeletedReplayData };
  }

  // 해당 노래 대댓글 상세 조회
  async findOne(postId : number, postcommentId : number, id: number) {
    const findPostData = await this.postsRepository.findOne({
      where : { id : postId, isOpen : true },
      select : ['id']
    });

    if(!findPostData){
      throw new NotFoundException("노래 목록이 존재하지 않습니다.");
    }

    const findCommentData = await this.postCommentsRepository.findOne({
      where : { id : postcommentId },
      select : ['id']
    });

    if(!findCommentData){
      throw new NotFoundException("노래 댓글이 존재하지 않습니다.");
    }

    const findOneReplayData = await this.postReplaysRepository.findOne({
      where : { postId : postId, postcommentId : postcommentId, id : id },
      select : ['id', 'context', 'createdAt']
    });

    if(!findOneReplayData){
      throw new NotFoundException("노래 대댓글 목록이 존재하지 않습니다.");
    }
    
    return { statusCode : 200, message : "성공적으로 노래 대댓글 전체 조회가 완료되었습니다.", data : findOneReplayData };
  }

  // 노래 대댓글 수정
  async update(postId : number, postcommentId : number, id: number, updatePostReplayDto: UpdatePostReplayDto) {
    const findPostData = await this.postsRepository.findOne({
      where : { id : postId, isOpen : true },
      select : ['id']
    });

    if(!findPostData){
      throw new NotFoundException("노래 목록이 존재하지 않습니다.");
    }

    const findCommentData = await this.postCommentsRepository.findOne({
      where : { id : postcommentId },
      select : ['id']
    });

    if(!findCommentData){
      throw new NotFoundException("노래 댓글이 존재하지 않습니다.");
    }

    const findOneReplayData = await this.postReplaysRepository.findOne({
      where : { postId : postId, postcommentId : postcommentId, id : id },
      select : ['id']
    });

    if(!findOneReplayData){
      throw new NotFoundException("노래 대댓글 목록이 존재하지 않습니다.");
    }

    const { context } = updatePostReplayDto;

    await this.postReplaysRepository.update(id, {
      context
    });

    return { statusCode : 201, message : "성공적으로 노래 대댓글 수정이 완료되었습니다." };
  }

  // 노래 대댓글 삭제
  async remove(postId : number, postcommentId : number, id: number) {
    const findPostData = await this.postsRepository.findOne({
      where : { id : postId, isOpen : true },
      select : ['id']
    });

    if(!findPostData){
      throw new NotFoundException("노래 목록이 존재하지 않습니다.");
    }

    const findCommentData = await this.postCommentsRepository.findOne({
      where : { id : postcommentId },
      select : ['id']
    });

    if(!findCommentData){
      throw new NotFoundException("노래 댓글이 존재하지 않습니다.");
    }

    const findOneReplayData = await this.postReplaysRepository.findOne({
      where : { postId : postId, postcommentId : postcommentId, id : id },
      select : ['id']
    });

    if(!findOneReplayData){
      throw new NotFoundException("노래 대댓글 목록이 존재하지 않습니다.");
    }

    await this.postReplaysRepository.delete(id);
    
    return { statusCode : 201, message : "성공적으로 노래 대댓글 삭제가 완료되었습니다." };
  }

  // 노래 대댓글 임시 삭제
  async softdelete(postId : number, postcommentId : number, id: number) {
    const findPostData = await this.postsRepository.findOne({
      where : { id : postId, isOpen : true },
      select : ['id']
    });

    if(!findPostData){
      throw new NotFoundException("노래 목록이 존재하지 않습니다.");
    }

    const findCommentData = await this.postCommentsRepository.findOne({
      where : { id : postcommentId },
      select : ['id']
    });

    if(!findCommentData){
      throw new NotFoundException("노래 댓글이 존재하지 않습니다.");
    }

    const findOneReplayData = await this.postReplaysRepository.findOne({
      where : { postId : postId, postcommentId : postcommentId, id : id },
      select : ['id']
    });

    if(!findOneReplayData){
      throw new NotFoundException("노래 대댓글 목록이 존재하지 않습니다.");
    }

    await this.postReplaysRepository.update(id, {
      deletedAt : new Date()
    });

    return { statusCode : 201, message : "성공적으로 노래 대댓글 삭제가 완료되었습니다." };
  }
}
