import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAlbumDto } from './dto/createAlbums';
import { UpdateAlbumDto } from './dto/updateAlbums';
import { InjectRepository } from '@nestjs/typeorm';
import { Albums } from './entities/album.entity';
import { Repository } from 'typeorm';
import { ImageService } from 'src/image/image.service';

@Injectable()
export class AlbumsService {
  constructor(@InjectRepository(Albums) private albumRepository : Repository<Albums>,
  private readonly imageService : ImageService){}

  async create(createAlbumDto: CreateAlbumDto, file : Express.Multer.File, albumId : number, userId : number) {
    const { albumTitle, albumSingerName, albumGenre, albumInfo, albumRelease } = createAlbumDto
    const findAlbum = await this.albumRepository.findOne({ where : { albumId } });
    const Body = findAlbum !== null && findAlbum.albumTitle === albumTitle && findAlbum.albumSingerName === albumSingerName && findAlbum.albumGenre === albumGenre;
    let albumImagefile = null;

    if(Body){
      throw new BadRequestException("앨범 정보가 이미 존재합니다.");
    }

    if(file){
      albumImagefile = await this.imageService.imageUploadS3(file);
    }

    const albumCreate = this.albumRepository.create({
      userId : userId,
      albumTitle,
      albumSingerName,
      albumImage : albumImagefile,
      albumGenre,
      albumInfo,
      albumRelease
    });

    await this.albumRepository.save(albumCreate);

    return { statusCode : 201, message : "앨범이 성공적으로 작성되었습니다.", albumCreate };
  }

  async findAll() {
    const findAlbumAll = await this.albumRepository.find();
    return findAlbumAll;
  }

  async findOne(albumId: number) {
    const findAlbum = await this.albumRepository.findOne({ where : { albumId } });

    return findAlbum;
  }

  async update(albumId: number, updateAlbumDto: UpdateAlbumDto, file : Express.Multer.File, userId : number) {
    const findAlbum = await this.albumRepository.findOne({ where : { albumId } });
    const { albumTitle, albumSingerName, albumInfo, albumGenre, albumRelease } = updateAlbumDto;
    const Body = findAlbum !== null && findAlbum.albumTitle === albumTitle && findAlbum.albumSingerName === albumSingerName && findAlbum.albumGenre === albumGenre;
    let albumImagefile = null;

    if(findAlbum === null){
      throw new NotFoundException("앨범이 존재하지 않습니다.");
    }

    if(Body){
      throw new BadRequestException("앨범 정보가 이미 존재합니다.");
    }

    if(findAlbum.userId !== userId){
      throw new NotFoundException("정보가 일치하지 않아 수정이 불가능합니다.");
    }

    if(file){
      albumImagefile = await this.imageService.imageUploadS3(file);
    } else if(!file) {
      albumImagefile = findAlbum.albumImage;
    }

    await this.albumRepository.update(albumId,{
      albumTitle,
      albumSingerName,
      albumImage : albumImagefile,
      albumInfo,
      albumGenre,
      albumRelease
    });

    return { statusCode : 201, message : "앨범이 성공적으로 수정되었습니다." };
  }

  async remove(albumId: number, userId : number) {
    const findAlbum = await this.albumRepository.findOne({ where : { albumId } });
    
    if(findAlbum === null){
      throw new NotFoundException("앨범이 존재하지 않습니다.");
    }

    if(findAlbum.userId !== userId){
      throw new NotFoundException("정보가 일치하지 않아 수정이 불가능합니다.");
    }

    await this.albumRepository.delete(albumId);

    return { statusCode : 201, message : "앨범이 성공적으로 삭제되었습니다." };
  }
}
