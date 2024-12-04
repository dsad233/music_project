import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PostCommentsService } from './post-comments.service';
import { CreatePostCommentDto } from './dto/create-post-comment.dto';
import { UpdatePostCommentDto } from './dto/update-post-comment.dto';
import { UserInfo } from 'src/users/decorator/userInfo.decorator';
import { Users } from 'src/users/entities/users.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('/posts/:postId/post-comments')
export class PostCommentsController {
  constructor(private readonly postCommentsService: PostCommentsService) {}

  // 게시글 댓글 생성
  @UseGuards(AuthGuard('jwt'))
  @Post('')
  async create(@Param('postId') postId : number, @UserInfo() users : Users, @Body() createPostCommentDto : CreatePostCommentDto) {
    const create = await this.postCommentsService.create(postId, users.id, createPostCommentDto);
    return create;
  }

  // 게시글 댓글 전체 조회
  @Get('')
  async findAll(@Param('postId') postId : number) {
    const findAll = await this.postCommentsService.findAll(postId);
    return findAll;
  }

  // 게시글 댓글 상세 조회
  @Get('/:id')
  async findOne(@Param('postId') postId : number, @Param('id') id : number) {
    const findOne = await this.postCommentsService.findOne(postId, id);
    return findOne;
  }

  // 게시글 댓글 수정
  @UseGuards(AuthGuard('jwt'))
  @Patch('/:id')
  async update(@Param('postId') postId : number, @Param('id') id: number, @Body() updatePostCommentDto: UpdatePostCommentDto) {
    const update = await this.postCommentsService.update(postId, id, updatePostCommentDto);
    return update;
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return this.postCommentsService.remove(+id);
  }
}
