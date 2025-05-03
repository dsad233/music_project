import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePostCommentDto } from './dto/create-post-comment.dto';
import { UpdatePostCommentDto } from './dto/update-post-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PostComments } from './entities/post-comments.entity';
import { Repository } from 'typeorm';
import { Posts } from '../entities/posts.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { TokenVerifyService } from 'src/tokenverify/token.verify.service';

@Injectable()
export class PostCommentsService {
  constructor(
    @InjectRepository(Posts)
    private readonly postsRepository: Repository<Posts>,
    @InjectRepository(PostComments)
    private postCommentsRepository: Repository<PostComments>,
    private readonly tokenVerifyService: TokenVerifyService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // 해당 게시물 댓글 생성
  async create(
    postId: number,
    refreshToken: string,
    userIp: string,
    userAgent: string,
    userId: number,
    createPostCommentDto: CreatePostCommentDto,
  ) {
    await this.tokenVerifyService.verifyRefreshToken(
      refreshToken,
      userIp,
      userAgent,
      userId,
    );
    const findPostOne = await this.postsRepository.findOne({
      where: { id: postId, isOpen: true },
      select: ['id'],
    });

    if (!findPostOne) {
      throw new NotFoundException('노래 목록이 존재하지 않습니다.');
    }

    const { context } = createPostCommentDto;

    const createPostComment = this.postCommentsRepository.create({
      userId,
      postId,
      context,
    });

    await this.postCommentsRepository.save(createPostComment);

    const cached = await this.cacheManager.get(`post:${postId}`);

    if (cached) {
      await this.cacheManager.del(`post:${postId}`);
    }

    return {
      statusCode: 201,
      message: '성공적으로 노래 댓글 생성이 완료되었습니다.',
    };
  }

  // 해당 게시물 댓글 삭제 리스트 전체 조회 (어드민만 가능)
  async findDeletedList() {
    const findComment = await this.postCommentsRepository
      .createQueryBuilder('post_comments')
      .withDeleted()
      .where('post_comments.deletedAt IS NOT NULL')
      .innerJoin('post_comments.users', 'users')
      .innerJoin('users.userInfos', 'userInfos')
      .select([
        'post_comments.id',
        'post_comments.context',
        'post_comments.createdAt',
        'post_comments.updatedAt',
        'post_comments.deletedAt',
        'users.id',
        'users.nickname',
        'userInfos.image',
      ])
      .getMany();

    if (findComment && findComment.length === 0) {
      throw new NotFoundException(
        '삭제 신청된 노래 댓글들이 존재하지 않습니다.',
      );
    }

    return {
      statusCode: 200,
      message: '성공적으로 삭제 예정된 노래 댓글 전체 조회가 완료되었습니다.',
      data: findComment,
    };
  }

  // 해당 게시물 댓글 수정
  async update(
    postId: number,
    id: number,
    refreshToken: string,
    userIp: string,
    userAgent: string,
    userId: number,
    updatePostCommentDto: UpdatePostCommentDto,
  ) {
    await this.tokenVerifyService.verifyRefreshToken(
      refreshToken,
      userIp,
      userAgent,
      userId,
    );
    const findPostOne = await this.postsRepository.findOne({
      where: { id: postId, isOpen: true },
      select: ['id'],
    });

    if (!findPostOne) {
      throw new NotFoundException('노래 목록이 존재하지 않습니다.');
    }

    const findOne = await this.postCommentsRepository.findOne({
      where: { id, postId },
      select: ['id', 'userId'],
    });

    if (!findOne) {
      throw new NotFoundException('노래 댓글 목록이 존재하지 않습니다.');
    }

    if (findOne.userId !== userId) {
      throw new UnauthorizedException(
        '유저 정보가 일치하지 않아 수정이 불가능합니다.',
      );
    }

    const { context } = updatePostCommentDto;

    await this.postCommentsRepository.update(id, {
      context,
    });

    const cached = await this.cacheManager.get(`post:${postId}`);

    if (cached) {
      await this.cacheManager.del(`post:${postId}`);
    }

    return {
      statusCode: 201,
      message: '성공적으로 노래 댓글 수정이 완료되었습니다.',
    };
  }

  // 해당 게시물 댓글 삭제
  async remove(postId: number, id: number) {
    const findPostOne = await this.postsRepository.findOne({
      where: { id: postId },
      withDeleted: true,
      select: ['id'],
    });

    if (!findPostOne) {
      throw new NotFoundException('노래 목록이 존재하지 않습니다.');
    }

    const findOne = await this.postCommentsRepository.findOne({
      where: { id, postId },
      select: ['id'],
    });

    if (!findOne) {
      throw new NotFoundException('노래 댓글 목록이 존재하지 않습니다.');
    }

    await this.postCommentsRepository.delete(id);

    const cached = await this.cacheManager.get(`post:${postId}`);

    if (cached) {
      await this.cacheManager.del(`post:${postId}`);
    }

    return {
      statusCode: 201,
      message: '성공적으로 노래 댓글 삭제가 완료되었습니다.',
    };
  }

  // 해당 게시물 댓글 임시 삭제 (회원만 가능)
  async softDelete(postId: number, id: number, userId: number) {
    const findPostOne = await this.postsRepository.findOne({
      where: { id: postId, isOpen: true },
      select: ['id'],
    });

    if (!findPostOne) {
      throw new NotFoundException('노래 목록이 존재하지 않습니다.');
    }

    const findOne = await this.postCommentsRepository.findOne({
      where: { id, postId },
      select: ['id', 'userId'],
    });

    if (!findOne) {
      throw new NotFoundException('노래 댓글 목록이 존재하지 않습니다.');
    }

    if (findOne.userId !== userId) {
      throw new UnauthorizedException(
        '유저 정보가 일치하지 않아 삭제가 불가능합니다.',
      );
    }

    await this.postCommentsRepository.update(id, {
      deletedAt: new Date(),
    });

    const cached = await this.cacheManager.get(`post:${postId}`);

    if (cached) {
      await this.cacheManager.del(`post:${postId}`);
    }

    return {
      statusCode: 201,
      message: '성공적으로 노래 댓글 삭제가 완료되었습니다.',
    };
  }
}
