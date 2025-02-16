import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Posts } from './entities/posts.entity';
import { Like, Repository } from 'typeorm';
import { ImageService } from 'src/image/image.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Posts) private postsRepository : Repository<Posts>,
    private readonly imageService : ImageService,
    @Inject(CACHE_MANAGER) private cacheManager : Cache
  ){}

  // 노래 게시물 생성
  async create(createPostDto: CreatePostDto, file : Express.Multer.File, userId : number) {
    const { title, singerName, genre, lyrics, releaseDate, isOpen } = createPostDto;
    const musicTitle = await this.postsRepository.findOne({ where : { title }, withDeleted : true, select : ['title'] });
    const musicSingerName = await this.postsRepository.findOne({ where : { singerName }, withDeleted : true, select : ['singerName'] });
    const musicGenre = await this.postsRepository.findOne({ where : { genre }, withDeleted : true, select : ['genre'] });
    const Body = musicTitle !== null && musicSingerName !== null && musicGenre !== null && musicTitle.title === title && musicSingerName.singerName === singerName && musicGenre.genre === genre;
    let postImgfile = null;

    if(Body){
      throw new BadRequestException("노래 목록이 이미 존재합니다.");
    }

    if(file){
      postImgfile = await this.imageService.imageUploadS3(file);
    }
    
    const postCreate = this.postsRepository.create({
      userId,
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
  async findAll(page : number, page_size : number, title : string, singerName : string) {
    if(!page){
      page = 1;
    }

    if(!page_size){
      page_size = 10;
    }

    let where : Record<string, any> = { isOpen : true };

    if(title){
      where.title = Like(`%${title}%`);
    }

    if(singerName){
      where.singerName = Like(`%${singerName}%`);
    }

    const postAll = await this.postsRepository.find({ 
      where,
      select : ['id', 'title', 'singerName', 'postImg'],
      skip : ((page - 1) * page_size),
      take : page_size
    });
    
    if(postAll && postAll.length === 0){
      throw new NotFoundException("노래 목록들이 존재하지 않습니다.");
    }

    const total = await this.postsRepository.count({
      where
    });

    const pageRange = Math.floor(total / page_size);

    return { statusCode : 200, message : "성공적으로 노래 전체 조회가 완료되었습니다.", total : total, pageRange : pageRange, data : postAll };
  }

  // 비공개된 노래 목록들 전체 조회 (어드민만 가능)
  async findNotOpendList(page : number, page_size : number, title : string, singerName : string){
    if(!page){
      page = 1;
    }

    if(!page_size){
      page_size = 10;
    }

    let where : Record<string, any> = { isOpen : false };

    if(title){
      where.title = Like(`%${title}%`);
    }

    if(singerName){
      where.singerName = Like(`%${singerName}%`);
    }

    const findData = await this.postsRepository.find({
      where,
      select : ['id', 'title', 'singerName', 'postImg', 'isOpen', 'createdAt', 'updatedAt'],
      skip : ((page - 1) * page_size),
      take : page_size
    });

    if(findData && findData.length === 0){
      throw new NotFoundException("비공개 노래 목록들이 존재하지 않습니다.");
    }

    const total = await this.postsRepository.count({
      where
    });

    const pageRange = Math.floor(total / page_size);

    return { statusCode : 200, message : "성공적으로 비공개 노래 전체 조회가 완료되었습니다.", total : total, pageRange : pageRange, data : findData };
  }

  // 삭제 신청된 노래 게시물 전체 조회 (어드민만 가능)
  async findDeletedList(page : number, page_size : number, title : string, singerName : string){
    if(!page){
      page = 1;
    }

    if(!page_size){
      page_size = 10;
    }

    const findData = this.postsRepository.createQueryBuilder('posts')
    .withDeleted()
    .where('posts.deletedAt IS NOT NULL')
    .innerJoin('posts.users', 'users')
    .innerJoin('users.userInfos', 'userInfos')
    .select([
      'posts.id',
      'posts.title',
      'posts.singerName',
      'posts.postImg',
      'posts.isOpen',
      'posts.createdAt',
      'posts.updatedAt',
      'posts.deletedAt',
      'users.id',
      'users.nickname',
      'userInfos.image'
    ])

    if(title){
      findData.andWhere('posts.title Like :title', { title : `%${title}%` });
    }

    if(singerName){
      findData.andWhere('posts.singerName Like :singerName', { singerName : `%${singerName}%` });
    }

    const offset = ((page - 1) * page_size);

    const [result, total] = await findData.skip(offset).take(page_size).getManyAndCount();

    if(result && result.length === 0){
      throw new NotFoundException("삭제 신청된 노래 목록들이 존재하지 않습니다.");
    }

    const pageRange = Math.floor(total / page_size);

    return { statusCode : 200, message : "성공적으로 삭제 예정된 노래 전체 조회가 완료되었습니다.", total : total, pageRange : pageRange, data : result };
  }

  // 내가 작성한 노래 목록들 전체 조회 (회원만 가능)
  async myPostfindAll(userId : number, page : number, page_size : number, title : string, singerName : string) {
    if(!page){
      page = 1;
    }

    if(!page_size){
      page_size = 10;
    }

    let where : Record<string, any> = { userId };
    
    if(title){
      where.title = Like(`%${title}%`);
    }

    if(singerName){
      where.singerName = Like(`%${singerName}%`);
    }

    const mypostAll = await this.postsRepository.find({ 
      where,
      select : ['id', 'title', 'singerName', 'postImg'],
      skip : ((page - 1) * page_size),
      take : page_size
    });

    if(!mypostAll){
      throw new NotFoundException("노래 목록들이 존재하지 않습니다.");
    }

    const total = await this.postsRepository.count({
      where
    });

    const pageRange = Math.floor(total / page_size);
      
    return { statusCode : 200, message : "성공적으로 작성한 노래 목록들 전체 조회가 완료되었습니다.", total : total, pageRange : pageRange, data : mypostAll };
  }

  // 노래 상세 목록 조회
  async findOne(id: number) {
    const cached = await this.cacheManager.get(`post:${id}`);

    if(cached){
      return { statusCode : 200, message : "성공적으로 노래 상세 조회가 완료되었습니다.", data : cached };
    }

    const findPost = await this.postsRepository.findOne({ 
      where : { id },
      relations : { postComments : { users : { userInfos : true }, postCommentLikes : { users : { userInfos : true } }, postReplays : { postReplayLikes : { users : { userInfos : true } }, users : { userInfos : true } } }, postLikes : { users : { userInfos : true } } },
      select : {
        id : true,
        title : true,
        singerName : true,
        postImg : true,
        genre : true,
        lyrics : true,
        releaseDate : true,
        isOpen : true,
        createdAt : true,
        postLikes : {
          id : true,
          createdAt : true,
          users : {
            id : true,
            nickname : true,
            userInfos : {
              image : true
            }
          }
        },
        postComments : {
          id : true,
          context : true,
          createdAt : true,
          users : {
            id : true,
            nickname : true,
            userInfos : {
              image : true
            }
          },
          postCommentLikes : {
            id : true,
            createdAt : true,
            users : {
              id : true,
              nickname : true,
              userInfos : {
                image : true
              }
            }
          },
          postReplays : {
            id : true,
            context : true,
            createdAt : true,
            users : {
              id : true,
              nickname : true,
              userInfos : {
                image : true
              }
            },
            postReplayLikes : {
              id : true,
              createdAt : true,
              users : {
                id : true,
                nickname : true,
                userInfos : {
                  image : true
                }
              }
            }
          },
        }
      }
    });
    
    if(!findPost){
      throw new NotFoundException("노래 목록이 존재하지 않습니다.");
    }
    
    if(!cached){
      await this.cacheManager.set(`post:${id}`, findPost, 60 * 10);
    }
    
    return { statusCode : 200, message : "성공적으로 노래 상세 조회가 완료되었습니다.", data : findPost };
  }

  // 노래 정보 수정
  async update(id: number, updatePostDto: UpdatePostDto, file : Express.Multer.File, userId : number) {
    const post = await this.postsRepository.findOne({ where : { id }, select : ['id', 'userId'] });

    if(!post){
      throw new NotFoundException("노래 목록이 존재하지 않습니다.");
    }

    if(post.userId !== userId){
      throw new BadRequestException("유저 정보가 일치하지 않아 수정이 불가능합니다.");
    }

    const { title, singerName, genre, lyrics, releaseDate, isOpen } = updatePostDto;
    const musicTitle = await this.postsRepository.findOne({ where : { title }, withDeleted : true, select : ['title'] });
    const musicSingerName = await this.postsRepository.findOne({ where : { singerName }, withDeleted : true, select : ['singerName'] });
    const musicGenre = await this.postsRepository.findOne({ where : { genre }, withDeleted : true, select : ['genre'] });
    const Body = musicTitle !== null && musicSingerName !== null && musicGenre !== null && musicTitle.title === title && musicSingerName.singerName === singerName && musicGenre.genre === genre;
    let postImgchange = null;
    

    if(Body){
      throw new BadRequestException("노래 게시물이 이미 존재합니다.");
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

    const cached = await this.cacheManager.get(`post:${id}`);

    if(cached){
      await this.cacheManager.del(`post:${id}`);
    }

    return { statusCode : 201, message : "노래 목록이 수정되었습니다." };
  }

  // 노래 삭제
  async remove(id: number) {
    const findPost = await this.postsRepository.findOne({ where : { id }, withDeleted : true, select : ['id'] });
    
    if(!findPost){
      throw new NotFoundException("노래 목록이 존재하지 않습니다.");
    }

    await this.postsRepository.delete(id);

    const cached = await this.cacheManager.get(`post:${id}`);

    if(cached){
      await this.cacheManager.del(`post:${id}`);
    }

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

    const cached = await this.cacheManager.get(`post:${id}`);

    if(cached){
      await this.cacheManager.del(`post:${id}`);
    }

    return { statusCode : 201, message : "노래 목록이 정상적으로 삭제되었습니다." };
  }
}
