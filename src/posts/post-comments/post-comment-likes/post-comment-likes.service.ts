import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Posts } from 'src/posts/entities/posts.entity';
import { Repository } from 'typeorm';
import { PostComments } from '../entities/post-comments.entity';
import { PostCommentLikes } from './entities/post-comment-like.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class PostCommentLikesService {
  constructor(
    @InjectRepository(Posts) private readonly postsRepository : Repository<Posts>,
    @InjectRepository(PostComments) private readonly postCommentsRepository : Repository<PostComments>,
    @InjectRepository(PostCommentLikes) private postCommentLikesRepository : Repository<PostCommentLikes>,
    @Inject(CACHE_MANAGER) private cacheManager : Cache
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

      const cached = await this.cacheManager.get(`post:${postId}`);

      if(cached){
        await this.cacheManager.del(`post:${postId}`);
      }

      return { statusCode : 201, message : "성공적으로 노래 댓글에 좋아요를 생성하였습니다." };
    } else {
      await this.postCommentLikesRepository.delete(findCommentLike.id);

      const cached = await this.cacheManager.get(`post:${postId}`);

      if(cached){
        await this.cacheManager.del(`post:${postId}`);
      }
      
      return { statusCode : 201, message : "성공적으로 노래 댓글에 좋아요를 삭제하였습니다." };
    }
  }
}
