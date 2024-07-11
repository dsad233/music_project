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

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(FileInterceptor('albumImage'))
  async create(@Body() createAlbumDto: CreateAlbumDto, @UploadedFile() file: Express.Multer.File, albumId : number, @UserInfo() users : Users) {
    const albumCreate = await this.albumsService.create(createAlbumDto, file, albumId, users.userId);
    return albumCreate;
  }

  @Get()
  async findAll() {
    const albumAll = await this.albumsService.findAll();
    return albumAll;
  }

  @Get('/:albumId')
  async findOne(@Param('albumId') albumId: number) {
    const findOne = await this.albumsService.findOne(albumId);
    return findOne;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/:albumId')
  @UseInterceptors(FileInterceptor('albumImage'))
  async update(@Param('albumId') albumId: number, @Body() updateAlbumDto: UpdateAlbumDto, @UploadedFile() file: Express.Multer.File, @UserInfo() users : Users) {
    const albumUpdate = await this.albumsService.update(albumId, updateAlbumDto, file, users.userId);
    return albumUpdate;
  }
  
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:albumId')
  async remove(@Param('albumId') albumId: number, @UserInfo() users : Users) {
    const albumDelete = await this.albumsService.remove(albumId, users.userId);
    return albumDelete;
  }
}
