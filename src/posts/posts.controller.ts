import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseGuards, UseInterceptors, Query, Req } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { UserInfo } from 'src/users/decorator/userInfo.decorator';
import { Users } from 'src/users/entities/users.entity';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 노래 게시물 생성
  @UseGuards(AuthGuard('jwt'))
  @Post('')
  @UseInterceptors(FileInterceptor('postImg'))
  async create(@Body() createPostDto: CreatePostDto, @UploadedFile() file: Express.Multer.File, @Req() req : Request, @UserInfo() users : Users) {
    const headerGetToken = req.cookies["refreshToken"];
    const userIp = req.ip;
    const userAgent = req.headers['user-agent'];
    const postCreate = await this.postsService.create(createPostDto, file, headerGetToken, userIp, userAgent, users.id);
    return postCreate;
  }

  // 노래 게시물 전체 조회
  @Get('')
  async findAll(@Query('page') page : number, @Query('page_size') page_size : number, @Query('title') title? : string, @Query('singerName') singerName? : string) {
    const postAll = await this.postsService.findAll(page, page_size, title, singerName);
    return postAll;
  }

  // 비공개된 노래 목록들 전체 조회 (어드민만 가능)
  @UseGuards(AuthGuard('jwt'))
  @Get('/notopend')
  async findNotOpenList(@Query('page') page : number, @Query('page_size') page_size : number, @Query('title') title? : string, @Query('singerName') singerName? : string){
    const notOpendList = await this.postsService.findNotOpendList(page, page_size, title, singerName);
    return notOpendList;
  }

  // 삭제 신청된 노래 게시물 전체 조회 (어드민만 가능)
  @UseGuards(AuthGuard('jwt'))
  @Get('/deleted')
  async deletedPostList(@Query('page') page : number, @Query('page_size') page_size : number, @Query('title') title? : string, @Query('singerName') singerName? : string){
    const findDeletedList = await this.postsService.findDeletedList(page, page_size, title, singerName);
    return findDeletedList;
  }

  // 내가 작성한 노래 목록들 조회 (본인 회원만 가능)
  @UseGuards(AuthGuard('jwt'))
  @Get('/myposts')
  async myPostfindAll(@Req() req : Request, @UserInfo() users : Users, @Query('page') page : number, @Query('page_size') page_size : number, @Query('title') title? : string, @Query('singerName') singerName? : string) {
    const headerGetToken = req.cookies["refreshToken"];
    const userIp = req.ip;
    const userAgent = req.headers['user-agent'];
    const myPostAll = await this.postsService.myPostfindAll(headerGetToken, userIp, userAgent, users.id, page, page_size, title, singerName);
    return myPostAll;
  }

  // 노래 상세 목록 조회
  @Get('/:id')
  async findOne(@Param('id') id: number) {
    const postOne = await this.postsService.findOne(id);
    return postOne;
  }

  // 노래 정보 수정
  @UseGuards(AuthGuard('jwt'))
  @Patch('/:id')
  @UseInterceptors(FileInterceptor('postImg'))
  async update(@Param('id') id: number, @Body() updatePostDto: UpdatePostDto, @UploadedFile() file: Express.Multer.File, @UserInfo() users : Users) {
    const postUpdate = await this.postsService.update(id, updatePostDto, file, users.id);
    return postUpdate;
  }

  // 노래 삭제
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:id')
  async remove(@Param('id') id: number) {
    const postDelete = await this.postsService.remove(id);
    return postDelete;
  }

  // 노래 임시 삭제 (회원만 가능)
  @UseGuards(AuthGuard('jwt'))
  @Delete('/softdelete/:id')
  async softDelete(@Param('id') id : number, @UserInfo() users : Users) {
    const postSoftDelete = await this.postsService.softDelete(id, users.id);
    return postSoftDelete;
  }
}
