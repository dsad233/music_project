import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { PostCommentLikesService } from './post-comment-likes.service';
import { UserInfo } from 'src/users/decorator/userInfo.decorator';
import { Users } from 'src/users/entities/users.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('/posts')
export class PostCommentLikesController {
  constructor(private readonly postCommentLikesService: PostCommentLikesService) {}

  // 해당 노래 목록 댓글에 좋아요 생성 및 삭제
  @UseGuards(AuthGuard('jwt'))
  @Post('/:postId/post-comments/:postCommentId/post-comment-likes')
  async create(@Param('postId') postId : number, @Param('postCommentId') postCommentId : number, @UserInfo() users : Users) {
    const create = await this.postCommentLikesService.create(postId, postCommentId, users.id);
    return create;
  }

  // 해당 노래 목록 댓글 좋아요 전체 조회 
  @Get('/:postId/post-comments/:postCommentId/post-comment-likes')
  async findAll(@Param('postId') postId : number, @Param('postCommentId') postCommentId : number) {
    const findAll = await this.postCommentLikesService.findAll(postId, postCommentId);
    return findAll;
  }

  // 해당 노래 목록 댓글 좋아요 상세 조회
  @Get('/:postId/post-comments/:postCommentId/post-comment-likes/:id')
  async findOne(@Param('postId') postId : number, @Param('postCommentId') postCommentId : number, @Param('id') id : number) {
    return this.postCommentLikesService.findOne(postId, postCommentId, id);
  }
}
