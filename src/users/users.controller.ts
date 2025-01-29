import { Controller, Get, Body, Patch, Param, Delete, UseGuards, UploadedFile, UseInterceptors, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/updateUser';
import { UserInfo } from './decorator/userInfo.decorator';
import { Users } from './entities/users.entity';
import { DeleteUserDto } from './dto/deleteUser';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 유저 전체 조회 (어드민만 가능)
  @UseGuards(AuthGuard('jwt'))
  @Get('')
  async findAll(@Query('page') page : number, @Query('page_size') page_size : number) {
    const userAll = await this.usersService.findAll(page, page_size);
    return userAll;
  }

  // 비공개로된 유저들 전체 조회 (어드민만 가능)
  @UseGuards(AuthGuard('jwt'))
  @Get('/notopend')
  async findNotOpenList(){
    const notOpenList = await this.usersService.findNotOpendList();
    return notOpenList;
  }

  // 삭제 신청된 유저들 전체 조회 (어드민만 가능)
  @UseGuards(AuthGuard('jwt'))
  @Get('/deleted')
  async deletedList(){
    const finddeleted = await this.usersService.findDeletedList();
    return finddeleted;
  }

  // 유저가 작성한 게시글 전체 조회 
  @Get('/posts/:id')
  async findUsePost(@Param('id') id : number) {
    const findUseData = await this.usersService.findUsePost(id);
    return findUseData
  }

  // 유저 상세 목록 조회 (어드민만 가능)
  @UseGuards(AuthGuard('jwt'))
  @Get('/:id')
  async findOne(@Param('id') id : number) {
    const userOne = await this.usersService.findOne(id);
    return userOne;
  }

  // 유저 자기 정보 조회 조회 (본인 회원만 가능)
  @UseGuards(AuthGuard('jwt'))
  @Get('/mypage')
  async findMyPage(@UserInfo() users : Users){
    const findMyData = await this.usersService.myPage(users.id);
    return findMyData;
  }

  // 유저 정보 수정
  @UseGuards(AuthGuard('jwt'))
  @Patch('/:id')
  @UseInterceptors(FileInterceptor('image'))
  async update(@Param('id') id : number, @UserInfo() users : Users, @Body() updateUserDto: UpdateUserDto, @UploadedFile() file: Express.Multer.File) {
    const userUpdate = await this.usersService.update(id, users, updateUserDto, file);
    return userUpdate;
  }

  // 유저 임시 회원 탈퇴 (회원만 가능)
  @UseGuards(AuthGuard('jwt'))
  @Delete('/softdelete')
  async softDelete(@UserInfo() users : Users, @Body() deleteUserDto : DeleteUserDto) {
    const userSoftDelete = await this.usersService.softDelete(users.id, deleteUserDto);
    return userSoftDelete;
  }

  // 유저 회원 탈퇴
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:id')
  async remove(@Param('id') id : number, @Body() deleteUserDto : DeleteUserDto) {
    const userDelete = await this.usersService.remove(id, deleteUserDto);
    return userDelete;
  }
}
