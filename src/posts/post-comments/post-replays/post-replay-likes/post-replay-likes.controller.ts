import { Controller, Get, Post, Param, UseGuards, Query } from '@nestjs/common';
import { PostReplayLikesService } from './post-replay-likes.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/users/decorator/userInfo.decorator';
import { Users } from 'src/users/entities/users.entity';

@Controller('/posts/:postId/post-comments/:postCommentId/post-replays/:postReplayId/post-replay-likes')
export class PostReplayLikesController {
  constructor(private readonly postReplayLikesService: PostReplayLikesService) {}

  // 해당 노래 대댓글 좋아요 생성 및 삭제
  @UseGuards(AuthGuard('jwt'))
  @Post('')
  async create(@Param('postId') postId : number, @Param('postCommentId') postCommentId : number, @Param('postReplayId') postReplayId : number, @UserInfo() users : Users) {
    const create = await this.postReplayLikesService.create(postId, postCommentId, postReplayId, users.id);
    return create;
  }

  // 해당 노래 대댓글 좋아요 전체 조회
  @Get('')
  async findAll(@Param('postId') postId : number, @Param('postCommentId') postCommentId : number, @Param('postReplayId') postReplayId : number, @Query('page') page : number, @Query('page_size') page_size : number) {
    const findAll = await this.postReplayLikesService.findAll(postId, postCommentId, postReplayId, page, page_size);
    return findAll;
  }

  // 해당 노래 대댓글 좋아요 상세 조회
  @Get('/:id')
  async findOne(@Param('postId') postId : number, @Param('postCommentId') postCommentId : number, @Param('postReplayId') postReplayId : number, @Param('id') id : number) {
    const findOne = await this.postReplayLikesService.findOne(postId, postCommentId, postReplayId, id);
    return findOne;
  }
}
