import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { CreateAlbumDto } from './dto/createAlbums';
import { UpdateAlbumDto } from './dto/updateAlbums';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserInfo } from 'src/users/decorator/userInfo.decorator';
import { Users } from 'src/users/entities/user.entity';

@Controller('albums')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  // 앨범 생성
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(FileInterceptor('albumImage'))
  async create(@Body() createAlbumDto: CreateAlbumDto, @UploadedFile() file: Express.Multer.File, @UserInfo() users : Users) {
    const albumCreate = await this.albumsService.create(createAlbumDto, file, users.userId);
    return albumCreate;
  }

  // 앨범 전체 조회
  @Get()
  async findAll() {
    const albumAll = await this.albumsService.findAll();
    return albumAll;
  }

  // 앨범 상세 목록 조회
  @Get('/:albumId')
  async findOne(@Param('albumId') albumId: number) {
    const findOne = await this.albumsService.findOne(albumId);
    return findOne;
  }


  // 한 앨범에 소속된 노래들 조회
  @Get('/allmusic/:albumId')
  async albumfindOne(@Param('albumId') albumId: number) {
    const findOne = await this.albumsService.albumfindOne(albumId);
    return findOne;
  }

  // 앨범 정보 수정
  @UseGuards(AuthGuard('jwt'))
  @Patch('/:albumId')
  @UseInterceptors(FileInterceptor('albumImage'))
  async update(@Param('albumId') albumId: number, @Body() updateAlbumDto: UpdateAlbumDto, @UploadedFile() file: Express.Multer.File, @UserInfo() users : Users) {
    const albumUpdate = await this.albumsService.update(albumId, updateAlbumDto, file, users.userId);
    return albumUpdate;
  }
  
  // 앨범 삭제
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:albumId')
  async remove(@Param('albumId') albumId: number, @UserInfo() users : Users) {
    const albumDelete = await this.albumsService.remove(albumId, users.userId);
    return albumDelete;
  }
}
