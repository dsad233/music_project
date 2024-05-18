import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/UpdateUser';
import { UserInfo } from './decorator/userInfo.decorator';
import { Users } from './entities/user.entity';
import { DeleteUserDto } from './dto/DeleteUser';
import { AuthGuard } from '@nestjs/passport';

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
  async update(@Param('userId') @UserInfo() user : Users, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(user.userId, updateUserDto);
  }

  @Delete('/:userId')
  async remove(@Param('userId') @UserInfo() user : Users, @Body() deleteUserDto : DeleteUserDto) {
    return await this.usersService.remove(user.userId, deleteUserDto);
  }
}
