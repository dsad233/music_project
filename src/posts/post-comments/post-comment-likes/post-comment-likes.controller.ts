import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { PostCommentLikesService } from './post-comment-likes.service';
import { UserInfo } from 'src/users/decorator/userInfo.decorator';
import { Users } from 'src/users/entities/users.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('/posts/:postId/post-comments/:postCommentId/post-comment-likes')
export class PostCommentLikesController {
  constructor(private readonly postCommentLikesService: PostCommentLikesService) {}

  // 해당 노래 목록 댓글에 좋아요 생성 및 삭제
  @UseGuards(AuthGuard('jwt'))
  @Post('')
  async create(@Param('postId') postId : number, @Param('postCommentId') postCommentId : number, @UserInfo() users : Users) {
    const create = await this.postCommentLikesService.create(postId, postCommentId, users.id);
    return create;
  }
}
