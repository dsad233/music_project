import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAlbumDto } from './dto/createAlbums';
import { UpdateAlbumDto } from './dto/updateAlbums';
import { InjectRepository } from '@nestjs/typeorm';
import { Albums } from './entities/album.entity';
import { Repository } from 'typeorm';
import { ImageService } from 'src/image/image.service';
import { Posts } from 'src/posts/entities/post.entity';

@Injectable()
export class AlbumsService {
  constructor(@InjectRepository(Albums) private albumRepository : Repository<Albums>,
  @InjectRepository(Posts) private postsRepository : Repository<Posts>,
  private readonly imageService : ImageService){}

  // 앨범 생성
  async create(createAlbumDto: CreateAlbumDto, file : Express.Multer.File, userId : number) {
    const { albumNumbering, albumTitle, albumSingerName, albumGenre, albumInfo, albumRelease } = createAlbumDto
    const title = await this.albumRepository.findOne({ where : { albumTitle } });
    const SingerName = await this.albumRepository.findOne({ where : { albumSingerName } });
    const Genre = await this.albumRepository.findOne({ where : { albumGenre } });
    const Body = title !== null && SingerName !== null && Genre !== null && title.albumTitle === albumTitle && SingerName.albumSingerName === albumSingerName && Genre.albumGenre === albumGenre;
    let albumImagefile = null;
    let Numbering = 0;

    if(Body){
      throw new BadRequestException("앨범 정보가 이미 존재합니다.");
    }

    if(file){
      albumImagefile = await this.imageService.imageUploadS3(file);
    }

    const maxAlbumNumbering = await this.albumRepository
    .createQueryBuilder("album")
    .select("MAX(album.albumNumbering)", "max")
    .getRawOne();


    if(maxAlbumNumbering.max !== null){
      Numbering = maxAlbumNumbering.max + 1 
    } else if(maxAlbumNumbering.max === null){
      Numbering = 1;
    }

    const albumCreate = this.albumRepository.create({
      userId : userId,
      albumNumbering : Numbering,
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

  // 앨범 전체 조회
  async findAll() {
    const findAlbumAll = await this.albumRepository.find();
    return findAlbumAll;
  }

  // 앨범 상세 목록 조회
  async findOne(albumId: number) {
    const findAlbum = await this.albumRepository.findOne({ where : { albumId } });

    return findAlbum;
  }

  // 한 앨범에 소속된 노래들 조회
  async albumfindOne(albumId: number) {
    const findAlbum = await this.albumRepository.findOne({ where : { albumId },
    select : ['albumTitle', 'albumSingerName', 'albumRelease', 'albumGenre']});
    const findPost = await this.postsRepository.find({ where : { albumId },
    select : ['title', 'singerName'] });
    let Count = 0;

    if(findAlbum === null && findPost.length === 0){
      throw new NotFoundException("앨범이 존재하지 않습니다.");
    }

    for(let i = 0; i < findPost.length; i++){
      Count++
    }

    return { findAlbum, findPost, Count };
  }

  // 앨범 정보 수정
  async update(albumId: number, updateAlbumDto: UpdateAlbumDto, file : Express.Multer.File, userId : number) {
    const findAlbum = await this.albumRepository.findOne({ where : { albumId } });
    const { albumTitle, albumSingerName, albumInfo, albumGenre, albumRelease } = updateAlbumDto;
    const title = await this.albumRepository.findOne({ where : { albumTitle } });
    const SingerName = await this.albumRepository.findOne({ where : { albumSingerName } });
    const Genre = await this.albumRepository.findOne({ where : { albumGenre } });
    const Body = title !== null && SingerName !== null && Genre !== null && title.albumTitle === albumTitle && SingerName.albumSingerName === albumSingerName && Genre.albumGenre === albumGenre;
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

  // 앨범 삭제
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
