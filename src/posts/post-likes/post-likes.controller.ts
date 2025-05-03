import { Controller, Post, Param } from '@nestjs/common';
import { PostLikesService } from './post-likes.service';
import { UserInfo } from 'src/utils/decorator/userInfo.decorator';
import { Users } from 'src/users/entities/users.entity';

@Controller('posts/:postId/post-likes')
export class PostLikesController {
  constructor(private readonly postLikesService: PostLikesService) {}

  // 해당 게시글 좋아요 생성 및 삭제
  @Post('')
  async create(@Param('postId') postId: number, @UserInfo() users: Users) {
    const create = await this.postLikesService.create(postId, users.id);
    return create;
  }
}
