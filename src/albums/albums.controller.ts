import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  Req,
} from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { CreateAlbumDto } from './dto/createAlbums';
import { UpdateAlbumDto } from './dto/updateAlbums';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserInfo } from 'src/utils/decorator/userInfo.decorator';
import { Users } from 'src/users/entities/users.entity';
import { Request } from 'express';
import { RolesGuard } from 'src/auth/guard/rolesGuard';
import { Roles } from 'src/utils/decorator/roles.decorator';
import { RolesEnum } from 'src/users/enums/roles.enum';
import { Public } from 'src/utils/decorator/isPublic.decorator';

@Controller('albums')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  // 앨범 생성
  @Post('')
  @UseInterceptors(FileInterceptor('albumImage'))
  async create(
    @Body() createAlbumDto: CreateAlbumDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @UserInfo() users: Users,
  ) {
    const headerGetToken = req.cookies['refreshToken'];
    const userIp = req.ip;
    const userAgent = req.headers['user-agent'];
    const albumCreate = await this.albumsService.create(
      createAlbumDto,
      file,
      headerGetToken,
      userIp,
      userAgent,
      users.id,
    );
    return albumCreate;
  }

  // 앨범 전체 조회
  @Public()
  @Get('')
  async findAll(
    @Query('page') page: number,
    @Query('page_size') page_size: number,
    @Query('albumTitle') albumTitle?: string,
    @Query('albumSingerName') albumSingerName?: string,
  ) {
    const albumAll = await this.albumsService.findAll(
      page,
      page_size,
      albumTitle,
      albumSingerName,
    );
    return albumAll;
  }

  // 비공개된 앨범 목록들 전체 조회 (어드민만 가능)
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin)
  @Get('/notopend')
  async findNotOpenList(
    @Query('page') page: number,
    @Query('page_size') page_size: number,
    @Query('albumTitle') albumTitle?: string,
    @Query('albumSingerName') albumSingerName?: string,
  ) {
    const notOpendList = await this.albumsService.findNotOpendList(
      page,
      page_size,
      albumTitle,
      albumSingerName,
    );
    return notOpendList;
  }

  // 삭제 신청된 앨범 목록 전체 조회 (어드민만 가능)
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin)
  @Get('/deleted')
  async findDeletedList(
    @Query('page') page: number,
    @Query('page_size') page_size: number,
    @Query('albumTitle') albumTitle?: string,
    @Query('albumSingerName') albumSingerName?: string,
  ) {
    const deletedList = await this.albumsService.findDeletedList(
      page,
      page_size,
      albumTitle,
      albumSingerName,
    );
    return deletedList;
  }

  // 앨범 상세 목록 조회
  @Public()
  @Get('/:id')
  async findOne(@Param('id') id: number) {
    const findOne = await this.albumsService.findOne(id);
    return findOne;
  }

  // 앨범에 노래 항목 업데이트
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin)
  @Patch('/register/:id')
  async musicUpdate(
    @Param('id') id: number,
    @Body('postId') postId: number,
    @Req() req: Request,
    @UserInfo() users: Users,
  ) {
    const headerGetToken = req.cookies['refreshToken'];
    const userIp = req.ip;
    const userAgent = req.headers['user-agent'];
    const musicRegister = await this.albumsService.musicUpdate(
      id,
      postId,
      headerGetToken,
      userIp,
      userAgent,
      users.id,
    );
    return musicRegister;
  }

  // 앨범 정보 수정
  @Patch('/:id')
  @UseInterceptors(FileInterceptor('albumImage'))
  async update(
    @Param('id') id: number,
    @Body() updateAlbumDto: UpdateAlbumDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @UserInfo() users: Users,
  ) {
    const headerGetToken = req.cookies['refreshToken'];
    const userIp = req.ip;
    const userAgent = req.headers['user-agent'];
    const albumUpdate = await this.albumsService.update(
      id,
      updateAlbumDto,
      file,
      headerGetToken,
      userIp,
      userAgent,
      users.id,
    );
    return albumUpdate;
  }

  // 앨범 삭제
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin)
  @Delete('/:id')
  async remove(@Param('id') id: number) {
    const albumDelete = await this.albumsService.remove(id);
    return albumDelete;
  }

  // 앨범 임시 삭제 (회원만 가능)
  @Delete('/softdelete/:id')
  async softDelete(
    @Param('id') id: number,
    @Req() req: Request,
    @UserInfo() users: Users,
  ) {
    const headerGetToken = req.cookies['refreshToken'];
    const userIp = req.ip;
    const userAgent = req.headers['user-agent'];
    const albumSoftDelete = await this.albumsService.softDelete(
      id,
      headerGetToken,
      userIp,
      userAgent,
      users.id,
    );
    return albumSoftDelete;
  }
}
