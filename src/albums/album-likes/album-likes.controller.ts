import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AlbumLikesService } from './album-likes.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/users/decorator/userInfo.decorator';
import { Users } from 'src/users/entities/users.entity';

@Controller('/albums/:albumId/album-likes')
export class AlbumLikesController {
  constructor(private readonly albumLikesService: AlbumLikesService) {}

  // 해당 앨범 좋아요 생성 및 삭제
  @UseGuards(AuthGuard('jwt'))
  @Post('')
  async create(@Param('albumId') albumId : number, @UserInfo() users : Users) {
    const create = await this.albumLikesService.create(albumId, users.id);
    return create;
  }
}
