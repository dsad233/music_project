import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PostReplayLikesService } from './post-replay-likes.service';
import { CreatePostReplayLikeDto } from './dto/create-post-replay-like.dto';
import { UpdatePostReplayLikeDto } from './dto/update-post-replay-like.dto';

@Controller('post-replay-likes')
export class PostReplayLikesController {
  constructor(private readonly postReplayLikesService: PostReplayLikesService) {}

  @Post()
  create(@Body() createPostReplayLikeDto: CreatePostReplayLikeDto) {
    return this.postReplayLikesService.create(createPostReplayLikeDto);
  }

  @Get()
  findAll() {
    return this.postReplayLikesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postReplayLikesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostReplayLikeDto: UpdatePostReplayLikeDto) {
    return this.postReplayLikesService.update(+id, updatePostReplayLikeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postReplayLikesService.remove(+id);
  }
}
