import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePostReplayDto } from './dto/create-post-replay.dto';
import { UpdatePostReplayDto } from './dto/update-post-replay.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PostReplays } from './entities/post-replay.entity';
import { Repository } from 'typeorm';
import { Posts } from 'src/posts/entities/posts.entity';
import { PostComments } from '../entities/post-comments.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class PostReplaysService {
  constructor(
    @InjectRepository(Posts)
    private readonly postsRepository: Repository<Posts>,
    @InjectRepository(PostComments)
    private readonly postCommentsRepository: Repository<PostComments>,
    @InjectRepository(PostReplays)
    private postReplaysRepository: Repository<PostReplays>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // 노래 대댓글 생성
  async create(
    userId: number,
    postId: number,
    postCommentId: number,
    createPostReplayDto: CreatePostReplayDto,
  ) {
    const findPostData = await this.postsRepository.findOne({
      where: { id: postId, isOpen: true },
      select: ['id'],
    });

    if (!findPostData) {
      throw new NotFoundException('노래 목록이 존재하지 않습니다.');
    }

    const findCommentData = await this.postCommentsRepository.findOne({
      where: { postId, id: postCommentId },
      select: ['id'],
    });

    if (!findCommentData) {
      throw new NotFoundException('노래 댓글이 존재하지 않습니다.');
    }

    const { context } = createPostReplayDto;

    const create = this.postReplaysRepository.create({
      userId,
      postId,
      postCommentId,
      context,
    });

    await this.postReplaysRepository.save(create);

    const cached = await this.cacheManager.get(`post:${postId}`);

    if (cached) {
      await this.cacheManager.del(`post:${postId}`);
    }

    return {
      statusCode: 201,
      message: '성공적으로 노래 대댓글 작성을 완료하였습니다.',
    };
  }

  // 해당 게시물 대댓글 삭제 리스트 전체 조회 (어드민만 가능)
  async deletedList() {
    const findDeletedReplayData = await this.postReplaysRepository
      .createQueryBuilder('post-replays')
      .withDeleted()
      .where('post-replays.deletedAt IS NOT NULL')
      .innerJoin('post-replays.users', 'users')
      .innerJoin('users.userInfos', 'userInfos')
      .select([
        'post-replays.id',
        'post-replays.context',
        'post-replays.createdAt',
        'post-replays.updatedAt',
        'post-replays.deletedAt',
        'users.id',
        'users.nickname',
        'userInfos.image',
      ])
      .getMany();

    if (findDeletedReplayData && findDeletedReplayData.length === 0) {
      throw new NotFoundException(
        '삭제 신청된 노래 대댓글 목록들이 존재하지 않습니다.',
      );
    }

    return {
      statusCode: 200,
      message: '성공적으로 삭제 예정된 노래 대댓글 전체 조회가 완료되었습니다.',
      data: findDeletedReplayData,
    };
  }

  // 노래 대댓글 수정
  async update(
    postId: number,
    postCommentId: number,
    id: number,
    userId: number,
    updatePostReplayDto: UpdatePostReplayDto,
  ) {
    const findPostData = await this.postsRepository.findOne({
      where: { id: postId, isOpen: true },
      select: ['id'],
    });

    if (!findPostData) {
      throw new NotFoundException('노래 목록이 존재하지 않습니다.');
    }

    const findCommentData = await this.postCommentsRepository.findOne({
      where: { postId, id: postCommentId },
      select: ['id'],
    });

    if (!findCommentData) {
      throw new NotFoundException('노래 댓글이 존재하지 않습니다.');
    }

    const findOneReplayData = await this.postReplaysRepository.findOne({
      where: { postId, postCommentId, id },
      select: ['id', 'userId'],
    });

    if (!findOneReplayData) {
      throw new NotFoundException('노래 대댓글 목록이 존재하지 않습니다.');
    }

    if (findOneReplayData.userId !== userId) {
      throw new UnauthorizedException(
        '유저 정보가 일치하지 않아 수정이 불가능합니다.',
      );
    }

    const { context } = updatePostReplayDto;

    await this.postReplaysRepository.update(id, {
      context,
    });

    const cached = await this.cacheManager.get(`post:${postId}`);

    if (cached) {
      await this.cacheManager.del(`post:${postId}`);
    }

    return {
      statusCode: 201,
      message: '성공적으로 노래 대댓글 수정이 완료되었습니다.',
    };
  }

  // 노래 대댓글 삭제
  async remove(postId: number, postCommentId: number, id: number) {
    const findPostData = await this.postsRepository.findOne({
      where: { id: postId },
      select: ['id'],
    });

    if (!findPostData) {
      throw new NotFoundException('노래 목록이 존재하지 않습니다.');
    }

    const findCommentData = await this.postCommentsRepository.findOne({
      where: { postId, id: postCommentId },
      select: ['id'],
    });

    if (!findCommentData) {
      throw new NotFoundException('노래 댓글이 존재하지 않습니다.');
    }

    const findOneReplayData = await this.postReplaysRepository.findOne({
      where: { postId, postCommentId, id },
      select: ['id'],
    });

    if (!findOneReplayData) {
      throw new NotFoundException('노래 대댓글 목록이 존재하지 않습니다.');
    }

    await this.postReplaysRepository.delete(id);

    const cached = await this.cacheManager.get(`post:${postId}`);

    if (cached) {
      await this.cacheManager.del(`post:${postId}`);
    }

    return {
      statusCode: 201,
      message: '성공적으로 노래 대댓글 삭제가 완료되었습니다.',
    };
  }

  // 노래 대댓글 임시 삭제
  async softDelete(
    postId: number,
    postCommentId: number,
    id: number,
    userId: number,
  ) {
    const findPostData = await this.postsRepository.findOne({
      where: { id: postId, isOpen: true },
      select: ['id'],
    });

    if (!findPostData) {
      throw new NotFoundException('노래 목록이 존재하지 않습니다.');
    }

    const findCommentData = await this.postCommentsRepository.findOne({
      where: { postId, id: postCommentId },
      select: ['id'],
    });

    if (!findCommentData) {
      throw new NotFoundException('노래 댓글이 존재하지 않습니다.');
    }

    const findOneReplayData = await this.postReplaysRepository.findOne({
      where: { postId, postCommentId, id },
      select: ['id', 'userId'],
    });

    if (!findOneReplayData) {
      throw new NotFoundException('노래 대댓글 목록이 존재하지 않습니다.');
    }

    if (findOneReplayData.userId !== userId) {
      throw new UnauthorizedException(
        '유저 정보가 일치하지 않아 삭제가 불가능합니다.',
      );
    }

    await this.postReplaysRepository.update(id, {
      deletedAt: new Date(),
    });

    const cached = await this.cacheManager.get(`post:${postId}`);

    if (cached) {
      await this.cacheManager.del(`post:${postId}`);
    }

    return {
      statusCode: 201,
      message: '성공적으로 노래 대댓글 삭제가 완료되었습니다.',
    };
  }
}
