import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { PostLikesService } from './post-likes.service';
import { UserInfo } from 'src/users/decorator/userInfo.decorator';
import { Users } from 'src/users/entities/users.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('posts/:postId/post-likes')
export class PostLikesController {
  constructor(private readonly postLikesService: PostLikesService) {}

  // 해당 게시글 좋아요 생성 및 삭제
  @UseGuards(AuthGuard('jwt'))
  @Post('')
  async create(@Param('postId') postId : number, @UserInfo() users : Users) {
    const create = await this.postLikesService.create(postId, users.id);
    return create;
  }

  // 해당 게시글 좋아요 목록 전체 조회
  @Get('')
  async findAll(@Param('postId') postId : number) {
    const find = await this.postLikesService.findAll(postId);
    return find;
  }

  // 해당 게시글 좋아요 수 카운트
  @UseGuards(AuthGuard('jwt'))
  @Get('/count')
  async findCount(@Param('postId') postId : number) {
    const findCountData = await this.postLikesService.findCount(postId);
    return findCountData;
  }

  // 해당 게시글 좋아요 목록 상세 조회 (대댓글까지 조회 가능하게 만들 예정)
  @Get('/:id')
  async findOne(@Param('postId') postId : number, @Param('id') id : number) {
    const findOne = await this.postLikesService.findOne(postId, id);
    return findOne;
  }
}
