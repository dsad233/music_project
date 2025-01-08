import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Posts } from 'src/posts/entities/post.entity';
import { Repository } from 'typeorm';
import { PostComments } from '../../entities/post-comments.entity';
import { PostReplays } from '../entities/post-replay.entity';
import { PostReplayLikes } from './entities/post-replay-like.entity';

@Injectable()
export class PostReplayLikesService {
  constructor(
    @InjectRepository(Posts) private readonly postsRepository : Repository<Posts>,
    @InjectRepository(PostComments) private readonly postCommentsRepository : Repository<PostComments>,
    @InjectRepository(PostReplays) private readonly postReplaysRepository : Repository<PostReplays>,
    @InjectRepository(PostReplayLikes) private postReplayLikesRepository : Repository<PostReplayLikes>
){}

  // 해당 노래 대댓글 좋아요 생성 및 삭제
  async create(postId : number, postCommentId : number, postReplayId : number, userId : number) {
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
      throw new NotFoundException("노래 댓글이 존재하지 않습니다.");
    }

    const findReplayOne = await this.postReplaysRepository.findOne({
      where : { postId, postCommentId, id : postReplayId },
      select : ['id']
    });

    if(!findReplayOne){
      throw new NotFoundException("노래 대댓글이 존재하지 않습니다.");
    }

    const findReplayLikeOne = await this.postReplayLikesRepository.findOne({
      where : { postId, postCommentId, postReplayId },
      select : ['id']
    });

    if(!findReplayLikeOne){
      const create = this.postReplayLikesRepository.create({
        userId,
        postId,
        postCommentId,
        postReplayId
      });

      await this.postReplayLikesRepository.save(create);

      return { statusCode : 201, message : "성공적으로 노래 대댓글 좋아요를 생성하였습니다." };
    } else {
      await this.postReplayLikesRepository.delete(findReplayLikeOne.id);
      return { statusCode : 201, message : "성공적으로 노래 대댓글 좋아요를 삭제하였습니다." };
    }
  }

  // 해당 노래 대댓글 좋아요 전체 조회
  async findAll(postId : number, postCommentId : number, postReplayId : number) {
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
      throw new NotFoundException("노래 댓글이 존재하지 않습니다.");
    }

    const findReplayOne = await this.postReplaysRepository.findOne({
      where : { postId, postCommentId, id : postReplayId },
      select : ['id']
    });

    if(!findReplayOne){
      throw new NotFoundException("노래 대댓글이 존재하지 않습니다.");
    }

    const find = await this.postReplayLikesRepository.find({
      where : { postId, postCommentId, postReplayId },
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
      throw new NotFoundException("노래 대댓글 좋아요 목록들이 존재하지 않습니다.");
    }

    return { statusCode : 200, meesage : "성공적으로 노래 대댓글 좋아요 전체 조회를 하였습니다.", data : find };
  }

  // 해당 노래 대댓글 좋아요 상세 조회
  async findOne(postId : number, postCommentId : number, postReplayId : number, id : number) {
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
      throw new NotFoundException("노래 댓글이 존재하지 않습니다.");
    }

    const findReplayOne = await this.postReplaysRepository.findOne({
      where : { postId, postCommentId, id : postReplayId },
      select : ['id']
    });

    if(!findReplayOne){
      throw new NotFoundException("노래 대댓글이 존재하지 않습니다.");
    }

    const findOne = await this.postReplayLikesRepository.findOne({
      where : { postId, postCommentId, postReplayId, id },
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
      throw new NotFoundException("노래 대댓글 좋아요 목록이 존재하지 않습니다.");
    }

    return { statusCode : 200, meesage : "성공적으로 노래 대댓글 좋아요 상세 조회를 하였습니다.", data : findOne };
  }
}
