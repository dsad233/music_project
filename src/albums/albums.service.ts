import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAlbumDto } from './dto/createAlbums';
import { UpdateAlbumDto } from './dto/updateAlbums';
import { InjectRepository } from '@nestjs/typeorm';
import { Albums } from './entities/album.entity';
import { Not, Repository } from 'typeorm';
import { ImageService } from 'src/image/image.service';
import { Posts } from 'src/posts/entities/post.entity';

@Injectable()
export class AlbumsService {
  constructor(
  @InjectRepository(Albums) private albumRepository : Repository<Albums>,
  @InjectRepository(Posts) private postsRepository : Repository<Posts>,
  private readonly imageService : ImageService
){}

  // 앨범 생성
  async create(createAlbumDto: CreateAlbumDto, file : Express.Multer.File, userId : number) {
    const { albumTitle, albumSingerName, albumGenre, albumInfo, albumRelease } = createAlbumDto
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
    const findAlbumAll = await this.albumRepository.find({ 
      where : { isOpen : true, deletedAt : null },
      select : ['id', 'albumTitle', 'albumSingerName', 'albumImage'] 
    });

    return { statusCode : 200, message : "성공적으로 앨범 전체 조회가 완료되었습니다.", data : findAlbumAll };
  }

  // 비공개된 앨범 목록들 전체 조회 (어드민만 가능)
  async findNotOpendList(){
    const findData = await this.albumRepository.find({ 
      where : { isOpen : false, deletedAt : null },
      select : ['id', 'albumTitle', 'albumImage', 'albumSingerName', 'albumGenre', 'albumRelease', 'isOpen', 'createdAt', 'updatedAt', 'deletedAt']
    });

    if(findData && findData.length === 0){
      throw new NotFoundException("비공개 앨범 목록들이 존재하지 않습니다.")
    }

    return { statusCode : 200, message : "성공적으로 비공개 앨범 전체 조회가 완료되었습니다.", data : findData };
  }

  // 삭제 신청된 앨범 목록 전체 조회 (어드민만 가능)
  async findDeletedList(){
    const findData = await this.albumRepository.find({
      where : { deletedAt : Not(null) },
      select : ['id', 'albumTitle', 'albumImage', 'albumSingerName', 'albumGenre', 'albumRelease', 'isOpen', 'createdAt', 'updatedAt', 'deletedAt']
    });

    if(findData && findData.length === 0){
      throw new NotFoundException("삭제 앨범 목록들이 존재하지 않습니다.")
    }

    return { statusCode : 200, message : "성공적으로 삭제 예정된 앨범 전체 조회가 완료되었습니다.", data : findData };
  }

  // 앨범 상세 목록 조회 // 수정 필요
  async findOne(id: number) {
    const findAlbum = await this.albumRepository.findOne({ 
      where : { id },
      relations : { posts : true },
      select : {
        id : true,
        albumTitle : true,
        albumSingerName : true,
        albumRelease : true,
        albumGenre : true,
        // 해당 앨범에 속해 있는 노래 카운트 수 표기 필요
        // 노래 재생 시간도 기입
        albumInfo : true,
        posts : {
          id : true,
          title : true,
          singerName : true
        }
      }
    });

    if(findAlbum === null){
      throw new NotFoundException("앨범이 존재하지 않습니다.")
    }

    return { statusCode : 200, message : "성공적으로 앨범 상세 조회가 완료되었습니다.", data : findAlbum };
  }

  // 한 앨범에 소속된 노래들 조회
  async albumfindOne(id: number) {
    const findAlbum = await this.albumRepository.findOne({ where : { id, isOpen : true, deletedAt : null },
      select : ['id']
    });

    if(findAlbum === null){
      throw new NotFoundException("앨범이 존재하지 않습니다.")
    }

    const findPost = await this.postsRepository.find({ 
      where : { albumId : id, isOpen : true, deletedAt : null },
      select : ['id', 'title', 'singerName', 'postImg'] 
    });

    if(findPost && findPost.length === 0){
      throw new NotFoundException("앨범 안 노래들이 존재하지 않습니다.");
    }

    return { statusCode : 200, message : "성공적으로 노래 목록 조회가 완료되었습니다.", data : findPost };
  }

  // 앨범 정보 수정
  async update(id: number, updateAlbumDto: UpdateAlbumDto, file : Express.Multer.File, userId : number) {
    const findAlbum = await this.albumRepository.findOne({ where : { id } });
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
      throw new NotFoundException("유저 정보가 일치하지 않아 수정이 불가능합니다.");
    }

    if(file){
      albumImagefile = await this.imageService.imageUploadS3(file);
    } else if(!file) {
      albumImagefile = findAlbum.albumImage;
    }

    await this.albumRepository.update(id,{
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
  async remove(id: number) {
    const findAlbum = await this.albumRepository.findOne({ where : { id } });
    
    if(findAlbum === null){
      throw new NotFoundException("앨범이 존재하지 않습니다.");
    }

    await this.albumRepository.delete(id);

    return { statusCode : 201, message : "앨범이 성공적으로 삭제되었습니다." };
  }

  // 앨범 임시 삭제 (회원만 가능)
  async softDelete(id : number, userId : number){
    const findData = await this.albumRepository.findOne({ 
      where : { id, deletedAt : null },
      select : ['id']
     });

     if(findData === null){
      throw new NotFoundException("앨범이 존재하지 않습니다.");
    }

    if(findData.userId !== userId){
      throw new NotFoundException("유저 정보가 일치하지 않아 삭제가 불가능합니다.");
    }

    await this.albumRepository.update(id, {
      deletedAt : new Date()
    });

    return { statusCode : 201, message : "앨범이 성공적으로 삭제되었습니다." };
  }
}
