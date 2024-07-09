import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { UserInfo } from 'src/users/decorator/userInfo.decorator';
import { Users } from 'src/users/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(FileInterceptor('postImg'))
  async create(@Body() createPostDto: CreatePostDto, @UploadedFile() file: Express.Multer.File, postId : number, @UserInfo() users : Users) {
    return await this.postsService.create(createPostDto, file, postId, users);
  }

  @Get()
  async findAll() {
    return await this.postsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/myposts')
  async myPostfindAll(@UserInfo() users : Users) {
    return await this.postsService.myPostfindAll(users.userId);
  }

  @Get('/:postId')
  async findOne(@Param('postId') postId: number) {
    return await this.postsService.findOne(postId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/:postId')
  @UseInterceptors(FileInterceptor('postImg'))
  async update(@Param('postId') postId: number, @Body() updatePostDto: UpdatePostDto, @UploadedFile() file: Express.Multer.File, @UserInfo() users : Users) {
    return await this.postsService.update(postId, updatePostDto, file, users.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/:postId')
  async remove(@Param('postId') postId: number, @UserInfo() users : Users) {
    return await this.postsService.remove(postId, users.userId);
  }
}
