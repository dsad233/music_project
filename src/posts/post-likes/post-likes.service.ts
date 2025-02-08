import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostLikes } from './entities/post-likes.entity';
import { Posts } from 'src/posts/entities/posts.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class PostLikesService {
  constructor(
    @InjectRepository(Posts) private readonly postsRepository : Repository<Posts>,
    @InjectRepository(PostLikes) private postLikesRepository : Repository<PostLikes>,
    @Inject(CACHE_MANAGER) private cacheManager : Cache 
  ){}
  
  // 해당 게시글 좋아요 생성 및 삭제
  async create(postId : number, userId : number) {
    const findPostOne = await this.postsRepository.findOne({
      where : { id : postId, isOpen : true },
      select : ['id']
    });
    
    if(!findPostOne){
      throw new NotFoundException("노래 목록이 존재하지 않습니다.");
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

      const cached = await this.cacheManager.get(`post:${postId}`);

      if(cached){
        await this.cacheManager.del(`post:${postId}`);
      }
  
      return { statusCode : 201, message : "성공적으로 노래 목록 좋아요가 생성되었습니다." };
    } else {
      await this.postLikesRepository.delete(findData.id);

      const cached = await this.cacheManager.get(`post:${postId}`);

      if(cached){
        await this.cacheManager.del(`post:${postId}`);
      }
      
      return { statusCode : 201, message : "성공적으로 노래 목록 좋아요가 삭제되었습니다." };
    }
  }
}
