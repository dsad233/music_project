import { Controller, Post, Param, UseGuards } from '@nestjs/common';
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
}
