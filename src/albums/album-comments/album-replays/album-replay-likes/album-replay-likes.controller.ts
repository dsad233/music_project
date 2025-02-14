import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AlbumReplayLikesService } from './album-replay-likes.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/users/decorator/userInfo.decorator';
import { Users } from 'src/users/entities/users.entity';

@Controller('/albums/:albumId/album-comments/:albumCommentId/album-replays/:albumReplayId/album-replay-likes')
export class AlbumReplayLikesController {
  constructor(private readonly albumReplayLikesService: AlbumReplayLikesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('')
  async create(@Param('albumId') albumId : number, @Param('albumCommentId') albumCommentId : number, @Param('albumReplayId') albumReplayId : number, @UserInfo() users : Users) {
    const create = await this.albumReplayLikesService.create(albumId, albumCommentId, albumReplayId, users.id); 
    return create;
  }
}
