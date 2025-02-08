import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AlbumCommentsService } from './album-comments.service';
import { CreateAlbumCommentDto } from './dto/create-album-comment.dto';
import { UpdateAlbumCommentDto } from './dto/update-album-comment.dto';
import { UserInfo } from 'src/users/decorator/userInfo.decorator';
import { Users } from 'src/users/entities/users.entity';

@Controller('/albums/:albumId/album-comments')
export class AlbumCommentsController {
  constructor(private readonly albumCommentsService: AlbumCommentsService) {}

  // 해당 앨범 댓글 생성
  @Post()
  async create(@Param('albumId') albumId : number,  @UserInfo() users : Users, @Body() createAlbumCommentDto: CreateAlbumCommentDto) {
    const create = await this.albumCommentsService.create(albumId, users.id, createAlbumCommentDto)
    return create;
  }

  // 해당 앨범 댓글 수정
  @Patch('/:id')
  async update(@Param('albumId') albumId: number, @Param('id') id: number, @UserInfo() users : Users, @Body() updateAlbumCommentDto: UpdateAlbumCommentDto) {
    const update = await this.albumCommentsService.update(albumId, id, users.id, updateAlbumCommentDto);
    return update;
  }

  // 해당 앨범 댓글 삭제
  @Delete('/:id')
  async remove(@Param('id') id: number) {
    const remove = await this.albumCommentsService.remove(id);
    return remove;
  }
}
