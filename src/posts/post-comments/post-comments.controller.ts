import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PostCommentsService } from './post-comments.service';
import { CreatePostCommentDto } from './dto/create-post-comment.dto';
import { UpdatePostCommentDto } from './dto/update-post-comment.dto';
import { UserInfo } from 'src/utils/decorator/userInfo.decorator';
import { Users } from 'src/users/entities/users.entity';
import { Request } from 'express';
import { RolesGuard } from 'src/auth/guard/rolesGuard';
import { Roles } from 'src/utils/decorator/roles.decorator';
import { RolesEnum } from 'src/users/enums/roles.enum';

@Controller('/posts')
export class PostCommentsController {
  constructor(private readonly postCommentsService: PostCommentsService) {}

  // 게시물 댓글 생성
  @Post('/:postId/post-comments')
  async create(
    @Param('postId') postId: number,
    @Req() req: Request,
    @UserInfo() users: Users,
    @Body() createPostCommentDto: CreatePostCommentDto,
  ) {
    const headerGetToken = req.cookies['refreshToken'];
    const userIp = req.ip;
    const userAgent = req.headers['user-agent'];
    const create = await this.postCommentsService.create(
      postId,
      headerGetToken,
      userIp,
      userAgent,
      users.id,
      createPostCommentDto,
    );
    return create;
  }

  // 해당 게시물 댓글 삭제 리스트 전체 조회 (어드민만 가능)
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin)
  @Get('/post-comments/deleted')
  async finddeletedList() {
    const deletedList = await this.postCommentsService.findDeletedList();
    return deletedList;
  }

  // 게시물 댓글 수정
  @Patch('/:postId/post-comments/:id')
  async update(
    @Param('postId') postId: number,
    @Param('id') id: number,
    @Body() updatePostCommentDto: UpdatePostCommentDto,
    @Req() req: Request,
    @UserInfo() users: Users,
  ) {
    const headerGetToken = req.cookies['refreshToken'];
    const userIp = req.ip;
    const userAgent = req.headers['user-agent'];
    const update = await this.postCommentsService.update(
      postId,
      id,
      headerGetToken,
      userIp,
      userAgent,
      users.id,
      updatePostCommentDto,
    );
    return update;
  }

  // 게시물 댓글 삭제
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin)
  @Delete('/:postId/post-comments/:id')
  async remove(@Param('postId') postId: number, @Param('id') id: number) {
    const remove = await this.postCommentsService.remove(postId, id);
    return remove;
  }

  // 게시물 댓글 임시 삭제
  @Delete('/:postId/post-comments/softdelete/:id')
  async softdelete(
    @Param('postId') postId: number,
    @Param('id') id: number,
    @UserInfo() users: Users,
  ) {
    const softDelete = await this.postCommentsService.softDelete(
      postId,
      id,
      users.id,
    );
    return softDelete;
  }
}
