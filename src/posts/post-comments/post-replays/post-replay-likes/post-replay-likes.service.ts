import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Posts } from 'src/posts/entities/posts.entity';
import { Repository } from 'typeorm';
import { PostComments } from '../../entities/post-comments.entity';
import { PostReplays } from '../entities/post-replay.entity';
import { PostReplayLikes } from './entities/post-replay-like.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class PostReplayLikesService {
  constructor(
    @InjectRepository(Posts)
    private readonly postsRepository: Repository<Posts>,
    @InjectRepository(PostComments)
    private readonly postCommentsRepository: Repository<PostComments>,
    @InjectRepository(PostReplays)
    private readonly postReplaysRepository: Repository<PostReplays>,
    @InjectRepository(PostReplayLikes)
    private postReplayLikesRepository: Repository<PostReplayLikes>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // 해당 노래 대댓글 좋아요 생성 및 삭제
  async create(
    postId: number,
    postCommentId: number,
    postReplayId: number,
    userId: number,
  ) {
    const findPostOne = await this.postsRepository.findOne({
      where: { id: postId, isOpen: true },
      select: ['id'],
    });

    if (!findPostOne) {
      throw new NotFoundException('노래 목록이 존재하지 않습니다.');
    }

    const findCommentOne = await this.postCommentsRepository.findOne({
      where: { postId, id: postCommentId },
      select: ['id'],
    });

    if (!findCommentOne) {
      throw new NotFoundException('노래 댓글이 존재하지 않습니다.');
    }

    const findReplayOne = await this.postReplaysRepository.findOne({
      where: { postId, postCommentId, id: postReplayId },
      select: ['id'],
    });

    if (!findReplayOne) {
      throw new NotFoundException('노래 대댓글이 존재하지 않습니다.');
    }

    const findReplayLikeOne = await this.postReplayLikesRepository.findOne({
      where: { postId, postCommentId, postReplayId },
      select: ['id'],
    });

    if (!findReplayLikeOne) {
      const create = this.postReplayLikesRepository.create({
        userId,
        postId,
        postCommentId,
        postReplayId,
      });

      await this.postReplayLikesRepository.save(create);

      const cached = await this.cacheManager.get(`post:${postId}`);

      if (cached) {
        await this.cacheManager.del(`post:${postId}`);
      }

      return {
        statusCode: 201,
        message: '성공적으로 노래 대댓글 좋아요를 생성하였습니다.',
      };
    } else {
      await this.postReplayLikesRepository.delete(findReplayLikeOne.id);

      const cached = await this.cacheManager.get(`post:${postId}`);

      if (cached) {
        await this.cacheManager.del(`post:${postId}`);
      }

      return {
        statusCode: 201,
        message: '성공적으로 노래 대댓글 좋아요를 삭제하였습니다.',
      };
    }
  }
}
