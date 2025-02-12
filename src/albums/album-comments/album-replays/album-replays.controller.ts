import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AlbumReplaysService } from './album-replays.service';
import { CreateAlbumReplayDto } from './dto/create-album-replay.dto';
import { UpdateAlbumReplayDto } from './dto/update-album-replay.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/users/decorator/userInfo.decorator';
import { Users } from 'src/users/entities/users.entity';

@Controller('/albums')
export class AlbumReplaysController {
  constructor(private readonly albumReplaysService: AlbumReplaysService) {}

  // 해당 앨범 대댓글 생성
  @UseGuards(AuthGuard('jwt'))
  @Post('/:albumId/album-comments/:albumCommentId/album-replays')
  async create(@Param('albumId') albumId : number, @Param('albumCommentId') albumCommentId : number, @Body() createAlbumReplayDto: CreateAlbumReplayDto, @UserInfo() users : Users) {
    const create = await this.albumReplaysService.create(albumId, albumCommentId, createAlbumReplayDto, users.id);
    return create;
  }

  // 해당 앨범 대댓글 삭제리스트 전체 조회 (어드민만)
  @UseGuards(AuthGuard('jwt'))
  @Get('/album-comments/album-replays/deleted')
  async findDeleteList(@Query('page') page : number, @Query('page_size') page_size : number) {
    const findDeleted = await this.albumReplaysService.findDeleteList(page, page_size);
    return findDeleted;
  }

  // 해당 앨범 대댓글 수정
  @UseGuards(AuthGuard('jwt'))
  @Patch('/:albumId/album-comments/:albumCommentId/album-replays/:id')
  async update(@Param('albumId') albumId : number, @Param('albumCommentId') albumCommentId : number, @Param('id') id : number, @Body() updateAlbumReplayDto: UpdateAlbumReplayDto, @UserInfo() users : Users) {
    const update = await this.albumReplaysService.update(albumId, albumCommentId, id, updateAlbumReplayDto, users.id);
    return update;
  }

  // 해당 앨범 대댓글 임시 삭제
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:albumId/album-comments/:albumCommentId/album-replays/softdelete/:id')
  async softdelete(@Param('albumId') albumId : number, @Param('albumCommentId') albumCommentId : number, @Param('id') id : number, @UserInfo() users : Users) {
    const softDelete = await this.albumReplaysService.softDelete(albumId, albumCommentId, id, users.id);
    return softDelete;
  }

  // 해당 앨범 대댓글 삭제
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:albumId/album-comments/:albumCommentId/album-replays/:id')
  async remove(@Param('albumId') albumId : number, @Param('albumCommentId') albumCommentId : number, @Param('id') id : number) {
    const remove = await this.albumReplaysService.remove(albumId, albumCommentId, id);
    return remove;
  }
}
