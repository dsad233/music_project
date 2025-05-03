import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AlbumCommentsService } from './album-comments.service';
import { CreateAlbumCommentDto } from './dto/create-album-comment.dto';
import { UpdateAlbumCommentDto } from './dto/update-album-comment.dto';
import { UserInfo } from 'src/utils/decorator/userInfo.decorator';
import { Users } from 'src/users/entities/users.entity';
import { RolesGuard } from 'src/auth/guard/rolesGuard';
import { Roles } from 'src/utils/decorator/roles.decorator';
import { RolesEnum } from 'src/users/enums/roles.enum';

@Controller('/albums')
export class AlbumCommentsController {
  constructor(private readonly albumCommentsService: AlbumCommentsService) {}

  // 해당 앨범 댓글 생성
  @Post('/:albumId/album-comments')
  async create(
    @Param('albumId') albumId: number,
    @UserInfo() users: Users,
    @Body() createAlbumCommentDto: CreateAlbumCommentDto,
  ) {
    const create = await this.albumCommentsService.create(
      albumId,
      users.id,
      createAlbumCommentDto,
    );
    return create;
  }

  // 해당 앨범 삭제리스트 조회
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin)
  @Get('/album-comments/deleted')
  async findDeleted(
    @Query('page') page: number,
    @Query('page_size') page_size: number,
  ) {
    const findDeleted = await this.albumCommentsService.findDeleteList(
      page,
      page_size,
    );
    return findDeleted;
  }

  // 해당 앨범 댓글 수정
  @Patch('/:albumId/album-comments/:id')
  async update(
    @Param('albumId') albumId: number,
    @Param('id') id: number,
    @UserInfo() users: Users,
    @Body() updateAlbumCommentDto: UpdateAlbumCommentDto,
  ) {
    const update = await this.albumCommentsService.update(
      albumId,
      id,
      users.id,
      updateAlbumCommentDto,
    );
    return update;
  }

  // 해당 앨범 댓글 임시 삭제
  @Delete('/:albumId/album-comments/softdelete/:id')
  async softDelete(
    @Param('albumId') albumId: number,
    @Param('id') id: number,
    @UserInfo() users: Users,
  ) {
    const softDelete = await this.albumCommentsService.softDelete(
      albumId,
      id,
      users.id,
    );
    return softDelete;
  }

  // 해당 앨범 댓글 삭제
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin)
  @Delete('/:albumId/album-comments/:id')
  async remove(@Param('albumId') albumId: number, @Param('id') id: number) {
    const remove = await this.albumCommentsService.remove(albumId, id);
    return remove;
  }
}
