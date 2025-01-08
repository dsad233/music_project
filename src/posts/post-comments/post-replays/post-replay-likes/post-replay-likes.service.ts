import { Injectable } from '@nestjs/common';
import { CreatePostReplayLikeDto } from './dto/create-post-replay-like.dto';
import { UpdatePostReplayLikeDto } from './dto/update-post-replay-like.dto';

@Injectable()
export class PostReplayLikesService {
  create(createPostReplayLikeDto: CreatePostReplayLikeDto) {
    return 'This action adds a new postReplayLike';
  }

  findAll() {
    return `This action returns all postReplayLikes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} postReplayLike`;
  }

  update(id: number, updatePostReplayLikeDto: UpdatePostReplayLikeDto) {
    return `This action updates a #${id} postReplayLike`;
  }

  remove(id: number) {
    return `This action removes a #${id} postReplayLike`;
  }
}
