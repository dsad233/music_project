import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Posts } from './entities/post.entity';
import { Like, Repository } from 'typeorm';
import { ImageService } from 'src/image/image.service';
import { Albums } from 'src/albums/entities/album.entity';

@Injectable()
export class PostsService {
  constructor(@InjectRepository(Posts) private postsRepository : Repository<Posts>,
  @InjectRepository(Albums) private albumRepository : Repository<Albums>,
  private readonly imageService : ImageService){}

  // 노래 생성
  async create(createPostDto: CreatePostDto, file : Express.Multer.File, userId : number) {
    const { title, singerName, genre, lyrics, ReleaseDate } = createPostDto;
    const MusicTitle = await this.postsRepository.findOne({ where : { title } });
    const MusicSingerName = await this.postsRepository.findOne({ where : { singerName } });
    const MusicGenre = await this.postsRepository.findOne({ where : { genre } });
    const Body = MusicTitle !== null && MusicSingerName !== null && MusicGenre !== null && MusicTitle.title === title && MusicSingerName.singerName === singerName && MusicGenre.genre === genre;
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
      ReleaseDate,
      postImg : postImgfile
    });

    await this.postsRepository.save(postCreate);

    return { statusCode : 201, message : "게시물이 성공적으로 작성되었습니다.", postCreate };
  }

  // 한 앨범안에 노래 업데이트
  async albumRegister (id : number, albumTitle : string) {
    const findAlbum = await this.albumRepository.findOne({ where : { albumTitle : Like(`${albumTitle}`) }});
    const findPost = await this.postsRepository.findOne({ where : { id } });
    
    if(findPost === null){
      throw new NotFoundException("노래가 존재하지 않습니다.");
    }

    if(findAlbum === null){
      throw new NotFoundException("앨범 제목이 존재하지 않습니다.");
    }

    if(findPost.albumId === findAlbum.id){
      throw new NotFoundException("이미 앨범에 등록된 노래입니다.");
    }
  
    let Id = null;

    if(findAlbum.albumTitle === albumTitle){
      Id = findAlbum.id
    }

    await this.postsRepository.update(id, {
      albumId : Id
    });

    return { statusCode : 201, message : "앨범에 노래가 정상적으로 등록되었습니다." };
  }

  // 노래 전체 조회
  async findAll() {
    const postAll = await this.postsRepository.find({ select : ['id', 'title', 'singerName', 'genre', 'ReleaseDate', 'createdAt'] })
    return postAll;
  }

  // 내가 작성한 노래 목록들 조회
  async myPostfindAll(userId : number) {
    const mypostAll = await this.postsRepository.find({ where : { userId } ,
      select : ['id', 'title', 'singerName', 'genre', 'ReleaseDate', 'createdAt'] });

      if(!mypostAll){
        throw new NotFoundException("게시물이 존재하지 않습니다.");
      }
      
    return mypostAll;
  }

  // 노래 상세 목록 조회
  async findOne(id: number) {
    const post = await this.postsRepository.findOne({ where : { id }, 
      select : ['title', 'singerName', 'genre', 'lyrics', 'createdAt']});
    
    if(!post){
      throw new NotFoundException("게시물이 존재하지 않습니다.");
    }
    
    return post;
  }

  // 노래 정보 수정
  async update(id: number, updatePostDto: UpdatePostDto, file : Express.Multer.File, userId : number) {
    const post = await this.postsRepository.findOne({ where : { id }});
    const { title, singerName, genre, lyrics, ReleaseDate } = updatePostDto;
    const MusicTitle = await this.postsRepository.findOne({ where : { title } });
    const MusicSingerName = await this.postsRepository.findOne({ where : { singerName } });
    const MusicGenre = await this.postsRepository.findOne({ where : { genre } });
    const Body = MusicTitle !== null && MusicSingerName !== null && MusicGenre !== null && MusicTitle.title === title && MusicSingerName.singerName === singerName && MusicGenre.genre === genre;
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
      ReleaseDate,
      postImg : postImgchange
    })

    return { statusCode : 201, message : "게시물이 수정되었습니다." };
  }

  // 노래 삭제
  async remove(id: number, userId : number) {
    const post = await this.postsRepository.findOne({ where : { id }});
    
    if(post === null){
      throw new NotFoundException("게시물이 존재하지 않습니다.");
    }

    if(post.userId !== userId){
      throw new BadRequestException("정보가 일치하지 않아 삭제가 불가능합니다.");
    }

    await this.postsRepository.delete(id);

    return { statusCode : 200, message : "게시물이 정상적으로 삭제되었습니다." };
  }
}
