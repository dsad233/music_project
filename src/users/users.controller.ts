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

  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get('/:userId')
  async findOne(@Param('userId') userId : number) {
    return await this.usersService.findOne(userId);
  }

  @Patch('/:userId')
  @UseInterceptors(FileInterceptor('image'))
  async update(@Param('userId') userId : number, @UserInfo() users : Users, @Body() updateUserDto: UpdateUserDto, @UploadedFile() file: Express.Multer.File) {
    return await this.usersService.update(userId, users, updateUserDto, file);
  }

  @Delete('/:userId')
  async remove(@Param('userId') userId : number, @UserInfo() users : Users, @Body() deleteUserDto : DeleteUserDto) {
    return await this.usersService.remove(userId, users, deleteUserDto);
  }
}
