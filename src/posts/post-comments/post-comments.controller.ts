import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PostCommentsService } from './post-comments.service';
import { CreatePostCommentDto } from './dto/create-post-comment.dto';
import { UpdatePostCommentDto } from './dto/update-post-comment.dto';
import { UserInfo } from 'src/users/decorator/userInfo.decorator';
import { Users } from 'src/users/entities/users.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('/posts')
export class PostCommentsController {
  constructor(private readonly postCommentsService: PostCommentsService) {}

  // 게시물 댓글 생성
  @UseGuards(AuthGuard('jwt'))
  @Post('/:postId/post-comments')
  async create(@Param('postId') postId : number, @UserInfo() users : Users, @Body() createPostCommentDto : CreatePostCommentDto) {
    const create = await this.postCommentsService.create(postId, users.id, createPostCommentDto);
    return create;
  }

  // 해당 게시물 댓글 삭제 리스트 전체 조회 (어드민만 가능)
  @UseGuards(AuthGuard('jwt'))
  @Get('/post-comments/deleted')
  async findDeletedList() {
    const deletedList = await this.postCommentsService.findDeletedList();
    return deletedList;
  }

  // 게시물 댓글 수정
  @UseGuards(AuthGuard('jwt'))
  @Patch('/:postId/post-comments/:id')
  async update(@Param('postId') postId : number, @Param('id') id: number, @Body() updatePostCommentDto: UpdatePostCommentDto, @UserInfo() users : Users) {
    const update = await this.postCommentsService.update(users.id, postId, id, updatePostCommentDto);
    return update;
  }

  // 게시물 댓글 삭제
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:postId/post-comments/:id')
  async remove(@Param('postId') postId : number, @Param('id') id : number) {
    const remove = await this.postCommentsService.remove(postId, id);
    return remove;
  }

  // 게시물 댓글 임시 삭제
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:postId/post-comments/softdelete/:id')
  async softDelete(@Param('postId') postId : number, @Param('id') id : number, @UserInfo() users : Users) {
    const softDelete = await this.postCommentsService.softDelete(postId, id, users.id);
    return softDelete;
  }
}
