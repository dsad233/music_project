import { Controller, Param, Post } from '@nestjs/common';
import { AlbumReplayLikesService } from './album-replay-likes.service';
import { UserInfo } from 'src/utils/decorator/userInfo.decorator';
import { Users } from 'src/users/entities/users.entity';

@Controller(
  '/albums/:albumId/album-comments/:albumCommentId/album-replays/:albumReplayId/album-replay-likes',
)
export class AlbumReplayLikesController {
  constructor(
    private readonly albumReplayLikesService: AlbumReplayLikesService,
  ) {}

  // 해당 앨범 대댓글 좋아요 생성 및 삭제
  @Post('')
  async create(
    @Param('albumId') albumId: number,
    @Param('albumCommentId') albumCommentId: number,
    @Param('albumReplayId') albumReplayId: number,
    @UserInfo() users: Users,
  ) {
    const create = await this.albumReplayLikesService.create(
      albumId,
      albumCommentId,
      albumReplayId,
      users.id,
    );
    return create;
  }
}
