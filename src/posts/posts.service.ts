import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Posts } from './entities/post.entity';
import { Repository } from 'typeorm';
import { ImageService } from 'src/image/image.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Posts) private postsRepository : Repository<Posts>,
    private readonly imageService : ImageService
  ){}

  // 노래 게시물 생성
  async create(createPostDto: CreatePostDto, file : Express.Multer.File, userId : number) {
    const { title, singerName, genre, lyrics, releaseDate, isOpen } = createPostDto;
    const musicTitle = await this.postsRepository.findOne({ where : { title }, withDeleted : true });
    const musicSingerName = await this.postsRepository.findOne({ where : { singerName}, withDeleted : true });
    const musicGenre = await this.postsRepository.findOne({ where : { genre }, withDeleted : true });
    const Body = musicTitle !== null && musicSingerName !== null && musicGenre !== null && musicTitle.title === title && musicSingerName.singerName === singerName && musicGenre.genre === genre;
    let postImgfile = null;

    if(Body){
      throw new BadRequestException("노래 목록이 이미 존재합니다.");
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
      isOpen,
      postImg : postImgfile
    });

    await this.postsRepository.save(postCreate);

    return { statusCode : 201, message : "노래 목록이 성공적으로 작성되었습니다.", data : postCreate };
  }

  // 노래 전체 조회
  async findAll() {
    const postAll = await this.postsRepository.find({ 
      where : { isOpen : true },
      select : ['id', 'title', 'singerName', 'postImg'] 
    });
    
    if(postAll && postAll.length === 0){
      throw new NotFoundException("노래 목록들이 존재하지 않습니다.");
    }

    return { statusCode : 200, message : "성공적으로 노래 전체 조회가 완료되었습니다.", data : postAll };
  }

  // 비공개된 노래 목록들 전체 조회 (어드민만 가능)
  async findNotOpendList(){
    const findData = await this.postsRepository.find({
      where : { isOpen : false },
      select : ['id', 'title', 'singerName', 'postImg']
    });

    if(findData && findData.length === 0){
      throw new NotFoundException("비공개 노래 목록들이 존재하지 않습니다.");
    }

    return { statusCode : 200, message : "성공적으로 비공개 노래 전체 조회가 완료되었습니다.", data : findData };
  }

  // 삭제 신청된 노래 게시물 전체 조회 (어드민만 가능)
  async findDeletedList(){
    const findData = await this.postsRepository.createQueryBuilder('posts')
    .withDeleted()
    .where('posts.deletedAt IS NOT NULL')
    .select([
      'posts.id',
      'posts.title',
      'posts.singerName',
      'posts.postImg'
    ])
    .getMany()

    if(findData && findData.length === 0){
      throw new NotFoundException("삭제 신청된 노래 목록들이 존재하지 않습니다.");
    }

    return { statusCode : 200, message : "성공적으로 삭제 예정된 노래 전체 조회가 완료되었습니다.", data : findData };
  }

  // 내가 작성한 노래 목록들 전체 조회 (회원만 가능)
  async myPostfindAll(userId : number) {
    const mypostAll = await this.postsRepository.find({ where : { userId } ,
      select : ['id', 'title', 'singerName', 'postImg', 'isOpen'] });

      if(!mypostAll){
        throw new NotFoundException("노래 목록들이 존재하지 않습니다.");
      }
      
    return { statusCode : 200, message : "성공적으로 작성한 노래 목록들 전체 조회가 완료되었습니다.", data : mypostAll };
  }

  // 노래 상세 목록 조회
  async findOne(id: number) {
    const findPost = await this.postsRepository.findOne({ 
      where : { id },
      relations : { postComments : true, postLikes : { users : true } },
      select : {
        id : true,
        title : true,
        singerName : true,
        genre : true,
        lyrics : true,
        releaseDate : true,
        createdAt : true,
        postLikes : {
          id : true,
          createdAt : true,
          users : {
            id : true,
            nickname : true,
            image : true
          }
        },
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
      throw new NotFoundException("노래 목록이 존재하지 않습니다.");
    }
    
    return { statusCode : 200, message : "성공적으로 노래 상세 조회가 완료되었습니다.", data : findPost };
  }

  // 노래 정보 수정
  async update(id: number, updatePostDto: UpdatePostDto, file : Express.Multer.File, userId : number) {
    const post = await this.postsRepository.findOne({ where : { id }});
    const { title, singerName, genre, lyrics, releaseDate, isOpen } = updatePostDto;
    const musicTitle = await this.postsRepository.findOne({ where : { title }, withDeleted : true });
    const musicSingerName = await this.postsRepository.findOne({ where : { singerName }, withDeleted : true });
    const musicGenre = await this.postsRepository.findOne({ where : { genre }, withDeleted : true });
    const Body = musicTitle !== null && musicSingerName !== null && musicGenre !== null && musicTitle.title === title && musicSingerName.singerName === singerName && musicGenre.genre === genre;
    let postImgchange = null;
    
    if(!post){
      throw new NotFoundException("노래 목록이 존재하지 않습니다.");
    }

    if(Body){
      throw new BadRequestException("노래 게시물이 이미 존재합니다.");
    }

    if(post.userId !== userId){
      throw new BadRequestException("유저 정보가 일치하지 않아 수정이 불가능합니다.");
    }

    if(file){
      postImgchange = await this.imageService.imageUploadS3(file);
    } else if(!file) {
      postImgchange = post.postImg;
    }

    const changeTitle = title ? title : post.title;
    const changeSingerName = singerName ? singerName : post.singerName;
    const changeGenre = genre ? genre : post.genre;
    const changeLyrics = lyrics ? lyrics : post.lyrics;
    const changeReleaseDate = releaseDate ? releaseDate : post.releaseDate;
    const changeIsOpen = isOpen !== null ? isOpen : post.isOpen;

    await this.postsRepository.update(id, {
      title : changeTitle,
      singerName : changeSingerName,
      genre : changeGenre,
      lyrics : changeLyrics,
      releaseDate : changeReleaseDate,
      isOpen : changeIsOpen,
      postImg : postImgchange
    })

    return { statusCode : 201, message : "노래 목록이 수정되었습니다." };
  }

  // 노래 삭제
  async remove(id: number) {
    const findPost = await this.postsRepository.findOne({ where : { id }, withDeleted : true });
    
    if(!findPost){
      throw new NotFoundException("노래 목록이 존재하지 않습니다.");
    }

    await this.postsRepository.delete(id);

    return { statusCode : 201, message : "노래 목록이 정상적으로 삭제되었습니다." };
  }


  // 노래 임시 삭제 (회원만 가능)
  async softDelete(id : number, userId : number){
    const findData = await this.postsRepository.findOne({
      where : { id },
      select : ['id', 'userId']
    });

    if(!findData){
      throw new NotFoundException("노래 목록이 존재하지 않습니다.");
    }

    if(findData.userId !== userId){
      throw new BadRequestException("유저 정보가 일치하지 않아 삭제가 불가능합니다.");
    }

    await this.postsRepository.update(id,{
      deletedAt : new Date()
    });

    return { statusCode : 201, message : "노래 목록이 정상적으로 삭제되었습니다." };
  }
}
