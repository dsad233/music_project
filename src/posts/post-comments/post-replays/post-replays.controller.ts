import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PostReplaysService } from './post-replays.service';
import { CreatePostReplayDto } from './dto/create-post-replay.dto';
import { UpdatePostReplayDto } from './dto/update-post-replay.dto';
import { UserInfo } from 'src/utils/decorator/userInfo.decorator';
import { Users } from 'src/users/entities/users.entity';
import { RolesGuard } from 'src/auth/guard/rolesGuard';
import { Roles } from 'src/utils/decorator/roles.decorator';
import { RolesEnum } from 'src/users/enums/roles.enum';

@Controller('/posts')
export class PostReplaysController {
  constructor(private readonly postReplaysService: PostReplaysService) {}

  // 노래 대댓글 생성
  @Post('/:postId/post-comments/:postCommentId/post-replays')
  async create(
    @Param('postId') postId: number,
    @Param('postCommentId') postCommentId: number,
    @Body() createPostReplayDto: CreatePostReplayDto,
    @UserInfo() users: Users,
  ) {
    return this.postReplaysService.create(
      users.id,
      postId,
      postCommentId,
      createPostReplayDto,
    );
  }

  // 해당 게시물 대댓글 삭제 리스트 전체 조회 (어드민만 가능)
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin)
  @Get('/post-replays/deleted')
  async deletedList() {
    const finddeleted = await this.postReplaysService.deletedList();
    return finddeleted;
  }

  // 노래 대댓글 수정
  @Patch('/:postId/post-comments/:postCommentId/post-replays/:id')
  async update(
    @Param('postId') postId: number,
    @Param('postCommentId') postCommentId: number,
    @Param('id') id: number,
    @UserInfo() users: Users,
    @Body() updatePostReplayDto: UpdatePostReplayDto,
  ) {
    const update = await this.postReplaysService.update(
      postId,
      postCommentId,
      id,
      users.id,
      updatePostReplayDto,
    );
    return update;
  }

  // 노래 대댓글 임시 삭제
  @Delete('/:postId/post-comments/:postCommentId/post-replays/softdelete/:id')
  async softdelete(
    @Param('postId') postId: number,
    @Param('postCommentId') postCommentId: number,
    @Param('id') id: number,
    @UserInfo() users: Users,
  ) {
    const softDelete = await this.postReplaysService.softDelete(
      postId,
      postCommentId,
      id,
      users.id,
    );
    return softDelete;
  }

  // 노래 대댓글 삭제
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin)
  @Delete('/:postId/post-comments/:postCommentId/post-replays/:id')
  async remove(
    @Param('postId') postId: number,
    @Param('postCommentId') postCommentId: number,
    @Param('id') id: number,
  ) {
    const remove = await this.postReplaysService.remove(
      postId,
      postCommentId,
      id,
    );
    return remove;
  }
}
