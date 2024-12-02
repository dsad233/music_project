import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Posts } from './entities/post.entity';
import { Like, Not, Repository } from 'typeorm';
import { ImageService } from 'src/image/image.service';
import { Albums } from 'src/albums/entities/album.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Posts) private postsRepository : Repository<Posts>,
    @InjectRepository(Albums) private albumRepository : Repository<Albums>,
    private readonly imageService : ImageService
  ){}

  // 노래 게시물 생성
  async create(createPostDto: CreatePostDto, file : Express.Multer.File, userId : number) {
    const { title, singerName, genre, lyrics, releaseDate } = createPostDto;
    const musicTitle = await this.postsRepository.findOne({ where : { title } });
    const musicSingerName = await this.postsRepository.findOne({ where : { singerName} });
    const musicGenre = await this.postsRepository.findOne({ where : { genre } });
    const Body = musicTitle !== null && musicSingerName !== null && musicGenre !== null && musicTitle.title === title && musicSingerName.singerName === singerName && musicGenre.genre === genre;
    let postImgfile = null;

    if(Body){
      throw new BadRequestException("노래 게시물이 이미 존재합니다.");
    }

    if(file){
      postImgfile = await this.imageService.imageUploadS3(file);
    }
    
    const postCreate = this.postsRepository.create({
      userId : userId,
      title,
      singerName,
      genre,
      lyrics,
      releaseDate,
      postImg : postImgfile
    });

    await this.postsRepository.save(postCreate);

    return { statusCode : 201, message : "게시물이 성공적으로 작성되었습니다.", data : postCreate };
  }

  // // 한 앨범안에 노래 업데이트 // 수정 필요
  // async albumRegister (id : number, albumTitle : string) {
  //   const findAlbum = await this.albumRepository.findOne({ where : { albumTitle : Like(`${albumTitle}`), deletedAt : null }});
  //   const findPost = await this.postsRepository.findOne({ where : { id, deletedAt : null } });
    
  //   if(findPost === null){
  //     throw new NotFoundException("노래가 존재하지 않습니다.");
  //   }

  //   if(findAlbum === null){
  //     throw new NotFoundException("앨범 제목이 존재하지 않습니다.");
  //   }

  //   if(findPost.albumId === findAlbum.id){
  //     throw new NotFoundException("이미 앨범에 등록된 노래입니다.");
  //   }
  
  //   let saveId = null;

  //   if(findAlbum.albumTitle === albumTitle){
  //     saveId = findAlbum.id
  //   }

  //   await this.postsRepository.update(id, {
  //     albumId : saveId
  //   });

  //   return { statusCode : 201, message : "앨범에 노래가 정상적으로 등록되었습니다." };
  // }

  // 노래 전체 조회
  async findAll() {
    const postAll = await this.postsRepository.find({ 
      where : { isOpen : true, deletedAt : null },
      select : ['id', 'title', 'singerName', 'postImg'] 
    });
    
    if(postAll && postAll.length === 0){
      throw new NotFoundException("게시물들이 존재하지 않습니다.");
    }

    return { statusCode : 200, message : "성공적으로 게시물 전체 조회가 완료되었습니다.", data : postAll };
  }

  // 비공개된 노래 목록들 전체 조회 (어드민만 가능)
  async notOpendList(){
    const findData = await this.postsRepository.find({
      where : { isOpen : false, deletedAt : null },
      select : ['id', 'title', 'singerName', 'postImg']
    });

    return { statusCode : 200, message : "성공적으로 비공개 게시물 전체 조회가 완료되었습니다.", data : findData };
  }

  // 삭제 신청된 노래 게시물 전체 조회 (어드민만 가능)
  async deletedList(){
    const findData = await this.postsRepository.find({
      where : { deletedAt : Not(null) },
      select : ['id', 'title', 'singerName', 'postImg']
    });

    return { statusCode : 200, message : "성공적으로 삭제 예정된 게시물 전체 조회가 완료되었습니다.", data : findData };
  }

  // 내가 작성한 노래 목록들 전체 조회 (회원만 가능)
  async myPostfindAll(userId : number) {
    const mypostAll = await this.postsRepository.find({ where : { userId } ,
      select : ['id', 'title', 'singerName', 'postImg', 'isOpen'] });

      if(!mypostAll){
        throw new NotFoundException("게시물이 존재하지 않습니다.");
      }
      
    return { statusCode : 200, message : "성공적으로 내 게시물 전체 조회가 완료되었습니다.", data : mypostAll };
  }

  // 노래 상세 목록 조회
  async findOne(id: number) {
    const findPost = await this.postsRepository.findOne({ 
      where : { id }, 
      relations : { postComments : true },
      select : {
        id : true,
        title : true,
        singerName : true,
        genre : true,
        lyrics : true,
        releaseDate : true,
        createdAt : true,
        postComments : {
          id : true,
          context : true,
          createdAt : true,
          users : {
            id : true,
            nickname : true,
            image : true
          }
        }
      }
    });
    
    if(!findPost){
      throw new NotFoundException("게시물이 존재하지 않습니다.");
    }
    
    return { statusCode : 200, message : "성공적으로 게시물 상세 조회가 완료되었습니다.", data : findPost };
  }

  // 노래 정보 수정
  async update(id: number, updatePostDto: UpdatePostDto, file : Express.Multer.File, userId : number) {
    const post = await this.postsRepository.findOne({ where : { id }});
    const { title, singerName, genre, lyrics, releaseDate } = updatePostDto;
    const musicTitle = await this.postsRepository.findOne({ where : { title } });
    const musicSingerName = await this.postsRepository.findOne({ where : { singerName } });
    const musicGenre = await this.postsRepository.findOne({ where : { genre } });
    const Body = musicTitle !== null && musicSingerName !== null && musicGenre !== null && musicTitle.title === title && musicSingerName.singerName === singerName && musicGenre.genre === genre;
    let postImgchange = null;
    
    if(post === null){
      throw new NotFoundException("노래 게시물이 존재하지 않습니다.");
    }

    if(Body){
      throw new BadRequestException("노래 게시물이 이미 존재합니다.");
    }

    if(post.userId !== userId){
      throw new BadRequestException("정보가 일치하지 않아 수정이 불가능합니다.");
    }

    if(file){
      postImgchange = await this.imageService.imageUploadS3(file);
    } else if(!file) {
      postImgchange = post.postImg;
    }

    await this.postsRepository.update(id, {
      title,
      singerName,
      genre,
      lyrics,
      releaseDate,
      postImg : postImgchange
    })

    return { statusCode : 201, message : "게시물이 수정되었습니다." };
  }

  // 노래 삭제
  async remove(id: number) {
    const findPost = await this.postsRepository.findOne({ where : { id }});
    
    if(findPost === null){
      throw new NotFoundException("게시물이 존재하지 않습니다.");
    }

    await this.postsRepository.delete(id);

    return { statusCode : 201, message : "게시물이 정상적으로 삭제되었습니다." };
  }


  // 노래 임시 삭제
  async softDelete(id : number, userId : number){
    const findData = await this.postsRepository.findOne({
      where : { id, deletedAt : null },
      select : ['id']
    });

    if(findData === null){
      throw new NotFoundException("게시물이 존재하지 않습니다.");
    }

    if(findData.userId !== userId){
      throw new BadRequestException("정보가 일치하지 않아 삭제가 불가능합니다.");
    }

    await this.postsRepository.update(id,{
      deletedAt : new Date()
    });

    return { statusCode : 201, message : "게시물이 정상적으로 삭제되었습니다." };
  }
}
