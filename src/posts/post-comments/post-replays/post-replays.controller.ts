import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PostReplaysService } from './post-replays.service';
import { CreatePostReplayDto } from './dto/create-post-replay.dto';
import { UpdatePostReplayDto } from './dto/update-post-replay.dto';
import { UserInfo } from 'src/users/decorator/userInfo.decorator';
import { Users } from 'src/users/entities/users.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('/posts')
export class PostReplaysController {
  constructor(private readonly postReplaysService: PostReplaysService) {}

  // 노래 대댓글 생성
  @UseGuards(AuthGuard('jwt'))
  @Post('/:postId/post-comments/:postCommentId/post-replays')
  async create(@Param('postId') postId : number, @Param('postCommentId') postCommentId : number, @Body() createPostReplayDto: CreatePostReplayDto, @UserInfo() users : Users) {
    return this.postReplaysService.create(users.id, postId, postCommentId, createPostReplayDto);
  }

  // 해당 노래 대댓글 전체 조회
  @Get('/:postId/post-comments/:postCommentId/post-replays')
  async findAll(@Param('postId') postId : number, @Param('postCommentId') postCommentId : number) {
    const findAll = await this.postReplaysService.findAll(postId, postCommentId);
    return findAll;
  }

  // 해당 게시물 대댓글 삭제 리스트 전체 조회 (어드민만 가능)
  @UseGuards(AuthGuard('jwt'))
  @Get('/post-replays/deleted')
  async deletedList() {
    const finddeleted = await this.postReplaysService.deletedList();
    return finddeleted;
  }

  // 해당 노래 대댓글 상세 조회
  @Get('/:postId/post-comments/:postCommentId/post-replays/:id')
  async findOne(@Param('postId') postId : number, @Param('postCommentId') postCommentId : number, @Param('id') id: number) {
    const findOne = await this.postReplaysService.findOne(postId, postCommentId, id);
    return findOne;
  }

  // 노래 대댓글 수정
  @UseGuards(AuthGuard('jwt'))
  @Patch('/:postId/post-comments/:postCommentId/post-replays/:id')
  async update(@Param('postId') postId : number, @Param('postCommentId') postCommentId : number, @Param('id') id: number, @Body() updatePostReplayDto: UpdatePostReplayDto) {
    const update = await this.postReplaysService.update(postId, postCommentId, id, updatePostReplayDto);
    return update;
  }

  // 노래 대댓글 삭제
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:postId/post-comments/:postCommentId/post-replays/:id')
  async remove(@Param('postId') postId : number, @Param('postCommentId') postCommentId : number, @Param('id') id: number) {
    const remove = await this.postReplaysService.remove(postId, postCommentId, id);
    return remove;
  }

  // 노래 대댓글 임시 삭제
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:postId/post-comments/:postCommentId/post-replays/softdelete/:id')
  async softdelete (@Param('postId') postId : number, @Param('postCommentId') postCommentId : number, @Param('id') id: number){
    const softdelete = await this.postReplaysService.softdelete(postId, postCommentId, id);
    return softdelete;
  }
}
