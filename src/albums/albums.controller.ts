import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { CreateAlbumDto } from './dto/createAlbums';
import { UpdateAlbumDto } from './dto/updateAlbums';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserInfo } from 'src/users/decorator/userInfo.decorator';
import { Users } from 'src/users/entities/users.entity';

@Controller('albums')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  // 앨범 생성
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(FileInterceptor('albumImage'))
  async create(@Body() createAlbumDto: CreateAlbumDto, @UploadedFile() file: Express.Multer.File, @UserInfo() users : Users) {
    const albumCreate = await this.albumsService.create(createAlbumDto, file, users.id);
    return albumCreate;
  }

  // 앨범 전체 조회
  @Get()
  async findAll() {
    const albumAll = await this.albumsService.findAll();
    return albumAll;
  }

  // 앨범 상세 목록 조회
  @Get('/:id')
  async findOne(@Param('id') id: number) {
    const findOne = await this.albumsService.findOne(id);
    return findOne;
  }


  // 한 앨범에 소속된 노래들 조회
  @Get('/allmusic/:id')
  async albumfindOne(@Param('id') id: number) {
    const findOne = await this.albumsService.albumfindOne(id);
    return findOne;
  }

  // 앨범 정보 수정
  @UseGuards(AuthGuard('jwt'))
  @Patch('/:id')
  @UseInterceptors(FileInterceptor('albumImage'))
  async update(@Param('albumId') id: number, @Body() updateAlbumDto: UpdateAlbumDto, @UploadedFile() file: Express.Multer.File, @UserInfo() users : Users) {
    const albumUpdate = await this.albumsService.update(id, updateAlbumDto, file, users.id);
    return albumUpdate;
  }
  
  // 앨범 삭제
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:id')
  async remove(@Param('albumId') id: number, @UserInfo() users : Users) {
    const albumDelete = await this.albumsService.remove(id, users.id);
    return albumDelete;
  }
}
