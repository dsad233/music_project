import { Controller, Get, Body, Patch, Param, Delete, UseGuards, UploadedFile, UseInterceptors, Query, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/updateUser';
import { UserInfo } from './decorator/userInfo.decorator';
import { Users } from './entities/users.entity';
import { DeleteUserDto } from './dto/deleteUser';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { Roles } from './decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guard/rolesGuard';
import { RolesEnum } from './enums/roles.enum';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 유저 전체 조회 (어드민만 가능)
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin)
  @Get('')
  async findAll(@Query('page') page : number, @Query('page_size') page_size : number, @Query('email') email? : string, @Query('nickname') nickname? : string, @Query('phoneNumber') phoneNumber? : string) {
    const userAll = await this.usersService.findAll(page, page_size, email, nickname, phoneNumber);
    return userAll;
  }

  // 비공개로된 유저들 전체 조회 (어드민만 가능)
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin)
  @Get('/notopend')
  async findNotOpenList(@Query('page') page : number, @Query('page_size') page_size : number, @Query('email') email? : string, @Query('nickname') nickname? : string, @Query('phoneNumber') phoneNumber? : string){
    const notOpenList = await this.usersService.findNotOpendList(page, page_size, email, nickname, phoneNumber);
    return notOpenList;
  }

  // 삭제 신청된 유저들 전체 조회 (어드민만 가능)
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin)
  @Get('/deleted')
  async deletedList(@Query('page') page : number, @Query('page_size') page_size : number, @Query('email') email? : string, @Query('nickname') nickname? : string, @Query('phoneNumber') phoneNumber? : string){
    const finddeleted = await this.usersService.findDeletedList(page, page_size, email, nickname, phoneNumber);
    return finddeleted;
  }
  
  // 유저 자기 정보 조회 조회 (본인 회원만 가능)
  @Get('/mypage')
  async findMyPage(@UserInfo() users : Users, @Req() req : Request){
    const headerGetToken = req.cookies["refreshToken"];
    const userIp = req.ip;
    const userAgent = req.headers['user-agent'];
    const findMyData = await this.usersService.myPage(headerGetToken, users.id, userIp, userAgent);
    return findMyData;
  }

  // 유저 상세 목록 조회 (어드민만 가능)
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin)
  @Get('/:id')
  async findOne(@Param('id') id : number) {
    const userOne = await this.usersService.findOne(id);
    return userOne;
  }


  // 유저 정보 수정
  @Patch('')
  @UseInterceptors(FileInterceptor('image'))
  async update(@UserInfo() users : Users, @Req() req : Request, @Body() updateUserDto: UpdateUserDto, @UploadedFile() file: Express.Multer.File) {
    const headerGetToken = req.cookies["refreshToken"];
    const userIp = req.ip;
    const userAgent = req.headers['user-agent'];
    const userUpdate = await this.usersService.update(headerGetToken, users, userIp, userAgent, updateUserDto, file);
    return userUpdate;
  }

  // 유저 임시 회원 탈퇴 (회원만 가능)
  @Delete('/softdelete')
  async softDelete(@UserInfo() users : Users, @Req() req : Request, @Body() deleteUserDto : DeleteUserDto) {
    const headerGetToken = req.cookies["refreshToken"];
    const userIp = req.ip;
    const userAgent = req.headers['user-agent'];
    const userSoftDelete = await this.usersService.softDelete(headerGetToken, users.id, userIp, userAgent, deleteUserDto);
    return userSoftDelete;
  }

  // 유저 회원 탈퇴
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin)
  @Delete('/:id')
  async remove(@Param('id') id : number) {
    const userDelete = await this.usersService.remove(id);
    return userDelete;
  }
}
