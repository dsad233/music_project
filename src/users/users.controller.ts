import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/updateUser';
import { UserInfo } from './decorator/userInfo.decorator';
import { Users } from './entities/users.entity';
import { DeleteUserDto } from './dto/deleteUser';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 유저 전체 조회 (어드민만 가능)
  @Get('')
  async findAll() {
    const userAll = await this.usersService.findAll();
    return userAll;
  }

  // 유저 상세 목록 조회 (어드민만 가능)
  @Get('/:id')
  async findOne(@Param('id') id : number) {
    const userOne = await this.usersService.findOne(id);
    return userOne;
  }

  // 비공개로된 유저들 전체 조회 (어드민만 가능)
  @Get('/notopend')
  async findNotOpenList(){
    const notOpenList = await this.usersService.findNotOpend();
    return notOpenList;
  }

  // 삭제 신청된 유저들 전체 조회 (어드민만 가능)
  @Get('/deleted')
  async deletedList(){
    const finddeleted = await this.usersService.deletedList();
    return finddeleted;
  }

  // 유저 마이페이지 조회 (본인 회원만 가능)
  @Get('/mypage')
  async findMyPage(@UserInfo() users : Users){
    const findMyData = await this.usersService.myPage(users.id);
    return findMyData;
  }

  // 유저 정보 수정
  @Patch('/:id')
  @UseInterceptors(FileInterceptor('image'))
  async update(@Param('id') id : number, @UserInfo() users : Users, @Body() updateUserDto: UpdateUserDto, @UploadedFile() file: Express.Multer.File) {
    const userUpdate = await this.usersService.update(id, users, updateUserDto, file);
    return userUpdate;
  }

  // 유저 회원 탈퇴
  @Delete('/:id')
  async remove(@Param('id') id : number, @UserInfo() users : Users, @Body() deleteUserDto : DeleteUserDto) {
    const userDelete = await this.usersService.remove(id, users, deleteUserDto);
    return userDelete;
  }

  // 유저 임시 회원 탈퇴 (회원만 가능)
  @Delete('/softdelete')
  async softDelete(@UserInfo() users : Users, deleteUserDto : DeleteUserDto) {
    const userSoftDelete = await this.usersService.softDelete(users.id, deleteUserDto);
    return userSoftDelete;
  }
}
