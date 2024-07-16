import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/updateUser';
import { UserInfo } from './decorator/userInfo.decorator';
import { Users } from './entities/user.entity';
import { DeleteUserDto } from './dto/deleteUser';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 유저 전체 조회
  @Get()
  async findAll() {
    const userAll = await this.usersService.findAll();
    return userAll;
  }

  // 유저 상세 목록 조회
  @Get('/:userId')
  async findOne(@Param('userId') userId : number) {
    const userOne = await this.usersService.findOne(userId);
    return userOne;
  }

  // 유저 정보 수정
  @Patch('/:userId')
  @UseInterceptors(FileInterceptor('image'))
  async update(@Param('userId') userId : number, @UserInfo() users : Users, @Body() updateUserDto: UpdateUserDto, @UploadedFile() file: Express.Multer.File) {
    const userUpdate = await this.usersService.update(userId, users, updateUserDto, file);
    return userUpdate;
  }

  // 유저 회원 탈퇴
  @Delete('/:userId')
  async remove(@Param('userId') userId : number, @UserInfo() users : Users, @Body() deleteUserDto : DeleteUserDto) {
    const userDelete = await this.usersService.remove(userId, users, deleteUserDto);
    return userDelete;
  }
}
