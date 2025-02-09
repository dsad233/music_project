import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAlbumDto } from './dto/createAlbums';
import { UpdateAlbumDto } from './dto/updateAlbums';
import { InjectRepository } from '@nestjs/typeorm';
import { Albums } from './entities/album.entity';
import { Repository } from 'typeorm';
import { ImageService } from 'src/image/image.service';
import { Posts } from 'src/posts/entities/posts.entity';

@Injectable()
export class AlbumsService {
  constructor(
  @InjectRepository(Posts) private postsRepository : Repository<Posts>,
  @InjectRepository(Albums) private albumRepository : Repository<Albums>,
  private readonly imageService : ImageService
){}

  // 앨범 생성
  async create(createAlbumDto: CreateAlbumDto, file : Express.Multer.File, userId : number) {
    const { albumTitle, albumSingerName, albumGenre, albumInfo, albumRelease, isOpen } = createAlbumDto
    const title = await this.albumRepository.findOne({ where : { albumTitle }, withDeleted : true });
    const SingerName = await this.albumRepository.findOne({ where : { albumSingerName }, withDeleted : true });
    const Genre = await this.albumRepository.findOne({ where : { albumGenre }, withDeleted : true });
    const Body = title !== null && SingerName !== null && Genre !== null && title.albumTitle === albumTitle && SingerName.albumSingerName === albumSingerName && Genre.albumGenre === albumGenre;
    let albumImagefile = null;

    if(Body){
      throw new BadRequestException("앨범 정보가 이미 존재합니다.");
    }

    if(file){
      albumImagefile = await this.imageService.imageUploadS3(file);
    }

    const albumCreate = this.albumRepository.create({
      userId,
      albumTitle,
      albumSingerName,
      albumImage : albumImagefile,
      albumGenre,
      albumInfo,
      albumRelease,
      isOpen
    });

    await this.albumRepository.save(albumCreate);

    return { statusCode : 201, message : "앨범이 성공적으로 작성되었습니다.", albumCreate };
  }

  // 앨범 전체 조회
  async findAll(page : number, page_size : number, albumTitle : string, albumSingerName : string) {
    if(!page){
      page = 1;
    }

    if(!page_size){
      page_size = 10;
    }

    const findAlbumAll = await this.albumRepository.find({ 
      where : { isOpen : true },
      select : ['id', 'albumTitle', 'albumSingerName', 'albumImage'],
      skip : ((page - 1) * page_size),
      take : page_size
    });

    if(findAlbumAll && findAlbumAll.length === 0){
      throw new NotFoundException("앨범 목록들이 존재하지 않습니다.");
    }

    return { statusCode : 200, message : "성공적으로 앨범 전체 조회가 완료되었습니다.", data : findAlbumAll };
  }

  // 비공개된 앨범 목록들 전체 조회 (어드민만 가능)
  async findNotOpendList(){
    const findData = await this.albumRepository.find({ 
      where : { isOpen : false },
      select : ['id', 'albumTitle', 'albumImage', 'albumSingerName', 'albumGenre', 'albumRelease', 'isOpen', 'createdAt', 'updatedAt', 'deletedAt']
    });

    if(findData && findData.length === 0){
      throw new NotFoundException("비공개 앨범 목록들이 존재하지 않습니다.")
    }

    return { statusCode : 200, message : "성공적으로 비공개 앨범 전체 조회가 완료되었습니다.", data : findData };
  }

  // 삭제 신청된 앨범 목록 전체 조회 (어드민만 가능)
  async findDeletedList(){
    const findData = await this.albumRepository.createQueryBuilder('albums')
    .withDeleted()
    .where('albums.deletedAt IS NOT NULL')
    .innerJoin('albums.users', 'users')
    .innerJoin('users.userInfos', 'userInfos')
    .select([
      'albums.id',
      'albums.albumTitle',
      'albums.albumSingerName',
      'albums.albumImage',
      'albums.albumTitle',
      'albums.albumGenre',
      'albums.albumRelease',
      'albums.isOpen',
      'albums.createdAt',
      'albums.updatedAt',
      'albums.deletedAt',
      'users.id',
      'users.nickname',
      'userInfos.image'
    ])
    .getMany();

    if(findData && findData.length === 0){
      throw new NotFoundException("삭제 앨범 목록들이 존재하지 않습니다.")
    }

    return { statusCode : 200, message : "성공적으로 삭제 예정된 앨범 전체 조회가 완료되었습니다.", data : findData };
  }

  // 앨범 상세 목록 조회
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
        albumInfo : true,
        posts : {
          id : true,
          title : true,
          singerName : true
        }
      }
    });

    if(!findAlbum){
      throw new NotFoundException("앨범이 존재하지 않습니다.")
    }

    return { statusCode : 200, message : "성공적으로 앨범 상세 조회가 완료되었습니다.", data : findAlbum };
  }

  // 앨범에 노래 항목 업데이트
  async musicUpdate (id : number, postId : number, userId : number) {
    const findAlbumData = await this.albumRepository.findOne({
      where : { id, isOpen : true },
      select : ['id', 'userId']
    });

    if(!findAlbumData){
      throw new NotFoundException("앨범 목록이 존재하지 않습니다.");
    }

    if(findAlbumData.userId !== userId){
      throw new BadRequestException("유저 정보가 일치하지 않아 업데이트가 불가능합니다.");
    }

    const findMusicData = await this.postsRepository.findOne({
      where : { id : postId, isOpen : true },
      select : ['id', 'albumId', 'userId']
    });

    if(!findMusicData){
      throw new NotFoundException("노래 목록이 존재하지 않습니다.");
    }

    if(findMusicData.userId !== userId){
      throw new BadRequestException("유저 정보가 일치하지 않아 업데이트가 불가능합니다.");
    }

    if(findMusicData.albumId === id){
      throw new BadRequestException("이미 해당 앨범에 등록된 노래 목록입니다.");
    }

    await this.postsRepository.update(postId, {
      albumId : id
    });

    return { statusCode : 201, message : "앨범에 노래가 정상적으로 등록되었습니다." };
  }

  // 앨범 정보 수정
  async update(id: number, updateAlbumDto: UpdateAlbumDto, file : Express.Multer.File, userId : number) {
    const findAlbum = await this.albumRepository.findOne({ where : { id }, select : ['id', 'userId'] });

    if(!findAlbum){
      throw new NotFoundException("앨범이 존재하지 않습니다.");
    }

    if(findAlbum.userId !== userId){
      throw new NotFoundException("유저 정보가 일치하지 않아 수정이 불가능합니다.");
    }

    const { albumTitle, albumSingerName, albumInfo, albumGenre, albumRelease, isOpen } = updateAlbumDto;
    const title = await this.albumRepository.findOne({ where : { albumTitle }, withDeleted : true, select : ['albumTitle'] });
    const SingerName = await this.albumRepository.findOne({ where : { albumSingerName }, withDeleted : true, select : ['albumTitle'] });
    const Genre = await this.albumRepository.findOne({ where : { albumGenre }, withDeleted : true, select : ['albumGenre'] });
    const Body = title !== null && SingerName !== null && Genre !== null && title.albumTitle === albumTitle && SingerName.albumSingerName === albumSingerName && Genre.albumGenre === albumGenre;
    let albumImagefile = null;

    if(Body){
      throw new BadRequestException("앨범 정보가 이미 존재합니다.");
    }

    if(file){
      albumImagefile = await this.imageService.imageUploadS3(file);
    } else if(!file) {
      albumImagefile = findAlbum.albumImage;
    }

    const changeTitle = albumTitle ? albumTitle : findAlbum.albumTitle;
    const changeSingerName = albumSingerName ? albumSingerName : findAlbum.albumSingerName;
    const changeInfo = albumInfo ? albumInfo : findAlbum.albumInfo;
    const changeGenre = albumGenre ? albumGenre : findAlbum.albumGenre;
    const changeRelease = albumRelease ? albumRelease : findAlbum.albumRelease;
    const changeIsOpen = isOpen !== null ? isOpen : findAlbum.isOpen;

    await this.albumRepository.update(id,{
      albumTitle : changeTitle,
      albumSingerName : changeSingerName, 
      albumImage : albumImagefile,
      albumInfo : changeInfo,
      albumGenre : changeGenre,
      albumRelease : changeRelease,
      isOpen : changeIsOpen
    });

    return { statusCode : 201, message : "앨범이 성공적으로 수정되었습니다." };
  }

  // 앨범 삭제
  async remove(id: number) {
    const findAlbum = await this.albumRepository.findOne({ where : { id }, withDeleted : true, select : ['id'] });
    
    if(!findAlbum){
      throw new NotFoundException("앨범이 존재하지 않습니다.");
    }

    await this.albumRepository.delete(id);

    return { statusCode : 201, message : "앨범이 성공적으로 삭제되었습니다." };
  }

  // 앨범 임시 삭제 (회원만 가능)
  async softDelete(id : number, userId : number){
    const findData = await this.albumRepository.findOne({ 
      where : { id },
      select : ['id', 'userId']
     });

     if(!findData){
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
