import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Query, Inject } from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { CreateAlbumDto } from './dto/createAlbums';
import { UpdateAlbumDto } from './dto/updateAlbums';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserInfo } from 'src/users/decorator/userInfo.decorator';
import { Users } from 'src/users/entities/users.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';


@Controller('albums')
export class AlbumsController {
  constructor(
    private readonly albumsService: AlbumsService,
    @Inject(CACHE_MANAGER) private cacheManager : Cache
  ) {}

  // 앨범 생성
  @UseGuards(AuthGuard('jwt'))
  @Post('')
  @UseInterceptors(FileInterceptor('albumImage'))
  async create(@Body() createAlbumDto: CreateAlbumDto, @UploadedFile() file: Express.Multer.File, @UserInfo() users : Users) {
    const albumCreate = await this.albumsService.create(createAlbumDto, file, users.id);
    return albumCreate;
  }

  // 앨범 전체 조회
  @Get('')
  async findAll(@Query('page') page : number, @Query('page_size') page_size : number, @Query('albumTitle') albumTitle? : string, @Query('albumSingerName') albumSingerName? : string) {
    const albumAll = await this.albumsService.findAll(page, page_size, albumTitle, albumSingerName);
    return albumAll;
  }

  // 비공개된 앨범 목록들 전체 조회 (어드민만 가능)
  @UseGuards(AuthGuard('jwt'))
  @Get('/notopend')
  async findNotOpenList(){
    const notOpendList = await this.albumsService.findNotOpendList();
    return notOpendList;
  }

  // 삭제 신청된 앨범 목록 전체 조회 (어드민만 가능)
  @UseGuards(AuthGuard('jwt'))
  @Get('/deleted')
  async findDeletedList(){
    const deletedList = await this.albumsService.findDeletedList();
    return deletedList;
  }

  // 앨범 상세 목록 조회
  @Get('/:id')
  async findOne(@Param('id') id: number) {
    const findOne = await this.albumsService.findOne(id);
    return findOne;
  }

  // 앨범에 노래 항목 업데이트
  @UseGuards(AuthGuard('jwt'))
  @Patch('/register/:id')
  async musicUpdate (@Param('id') id : number, @Body('postId') postId : number, @UserInfo() users : Users) {
    const musicRegister = await this.albumsService.musicUpdate(id, postId, users.id);
    return musicRegister;
  }

  // 앨범 정보 수정
  @UseGuards(AuthGuard('jwt'))
  @Patch('/:id')
  @UseInterceptors(FileInterceptor('albumImage'))
  async update(@Param('id') id: number, @Body() updateAlbumDto: UpdateAlbumDto, @UploadedFile() file: Express.Multer.File, @UserInfo() users : Users) {
    const albumUpdate = await this.albumsService.update(id, updateAlbumDto, file, users.id);
    return albumUpdate;
  }
  
  // 앨범 삭제
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:id')
  async remove(@Param('id') id: number) {
    const albumDelete = await this.albumsService.remove(id);
    return albumDelete;
  }

  // 앨범 임시 삭제 (회원만 가능)
  @UseGuards(AuthGuard('jwt'))
  @Delete('/softdelete/:id')
  async softDelete(@Param('id') id: number, @UserInfo() users : Users) {
    const albumSoftDelete = await this.albumsService.softDelete(id, users.id);
    return albumSoftDelete;
  }
}
