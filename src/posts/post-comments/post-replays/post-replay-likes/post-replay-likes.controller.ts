import { Controller, Post, Param } from '@nestjs/common';
import { PostReplayLikesService } from './post-replay-likes.service';
import { UserInfo } from 'src/utils/decorator/userInfo.decorator';
import { Users } from 'src/users/entities/users.entity';

@Controller(
  '/posts/:postId/post-comments/:postCommentId/post-replays/:postReplayId/post-replay-likes',
)
export class PostReplayLikesController {
  constructor(
    private readonly postReplayLikesService: PostReplayLikesService,
  ) {}

  // 해당 노래 대댓글 좋아요 생성 및 삭제
  @Post('')
  async create(
    @Param('postId') postId: number,
    @Param('postCommentId') postCommentId: number,
    @Param('postReplayId') postReplayId: number,
    @UserInfo() users: Users,
  ) {
    const create = await this.postReplayLikesService.create(
      postId,
      postCommentId,
      postReplayId,
      users.id,
    );
    return create;
  }
}
