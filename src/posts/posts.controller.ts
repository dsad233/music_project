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

  // 노래 생성
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(FileInterceptor('postImg'))
  async create(@Body() createPostDto: CreatePostDto, @UploadedFile() file: Express.Multer.File, @UserInfo() users : Users) {
    const postCreate = await this.postsService.create(createPostDto, file, users.userId);
    return postCreate;
  }

  // 한 앨범안에 노래 업데이트
  @UseGuards(AuthGuard('jwt'))
  @Patch('/albumregister/:postId')
  async albumRegister(@Param('postId') postId : number ,@Body('albumTitle') albumTitle : string) {
    const albumRegister = await this.postsService.albumRegister(postId, albumTitle);
    return albumRegister;
  }

  // 노래 전체 조회
  @Get()
  async findAll() {
    const postAll = await this.postsService.findAll();
    return postAll;
  }

  // 내가 작성한 노래 목록들 조회
  @UseGuards(AuthGuard('jwt'))
  @Get('/myposts')
  async myPostfindAll(@UserInfo() users : Users) {
    const myPostAll = await this.postsService.myPostfindAll(users.userId);
    return myPostAll;
  }

  // 노래 상세 목록 조회
  @Get('/:postId')
  async findOne(@Param('postId') postId: number) {
    const postOne = await this.postsService.findOne(postId);
    return postOne;
  }

  // 노래 정보 수정
  @UseGuards(AuthGuard('jwt'))
  @Patch('/:postId')
  @UseInterceptors(FileInterceptor('postImg'))
  async update(@Param('postId') postId: number, @Body() updatePostDto: UpdatePostDto, @UploadedFile() file: Express.Multer.File, @UserInfo() users : Users) {
    const postUpdate = await this.postsService.update(postId, updatePostDto, file, users.userId);
    return postUpdate;
  }

  // 노래 삭제
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:postId')
  async remove(@Param('postId') postId: number, @UserInfo() users : Users) {
    const postDelete = await this.postsService.remove(postId, users.userId);
    return postDelete;
  }
}
