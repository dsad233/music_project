import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Posts } from './entities/post.entity';
import { Repository } from 'typeorm';
import { ImageService } from 'src/image/image.service';
import { Users } from 'src/users/entities/user.entity';

@Injectable()
export class PostsService {
  constructor(@InjectRepository(Posts) private postsRepository : Repository<Posts>,
  private readonly imageService : ImageService){}

  async create(createPostDto: CreatePostDto, file : Express.Multer.File, postId : number, users : Users) {
    console.log(file)
    const post = await this.postsRepository.findOne({ where : { postId }});
    
    const { title, genre, lyrics, albumTitle, albumInfo } = createPostDto;
    const Body = post !== null && post.title === title && post.genre === genre && post.albumTitle === albumTitle && post.albumInfo === albumInfo;
    let postImgfile = null;

    if(Body){
      throw new BadRequestException("게시물이 이미 존재합니다.");
    }

    if(file){
      postImgfile = await this.imageService.imageUploadS3(file);
    }
    
    const postCreate = this.postsRepository.create({
      userId : users.userId,
      nickname : users.nickname,
      title,
      genre,
      lyrics,
      albumTitle,
      albumInfo,
      postImg : postImgfile
    });

    await this.postsRepository.save(postCreate);

    return { statusCode : 201, message : "게시물이 성공적으로 작성되었습니다.", postCreate };
  }

  async findAll() {
    const postAll = await this.postsRepository.find({ select : ['postId', 'title', 'nickname', 'genre', 'albumTitle', 'createdAt'] })
    return postAll;
  }

  async myPostfindAll(userId : number) {
    const mypostAll = await this.postsRepository.find({ where : { userId } ,
      select : ['postId', 'title', 'nickname', 'genre', 'albumTitle', 'createdAt'] });

      if(!mypostAll){
        throw new NotFoundException("게시물이 존재하지 않습니다.");
      }
      
    return mypostAll;
  }

  async findOne(postId: number) {
    const post = await this.postsRepository.findOne({ where : { postId }, 
      select : ['title', 'nickname', 'genre', 'lyrics', 'albumTitle', 'createdAt']});
    
    if(!post){
      throw new NotFoundException("게시물이 존재하지 않습니다.");
    }
    
    return post;
  }

  async update(postId: number, updatePostDto: UpdatePostDto, file : Express.Multer.File, userId : number) {
    const post = await this.postsRepository.findOne({ where : { postId }});
    const { title, genre, lyrics, albumTitle, albumInfo } = updatePostDto;
    const Body = post !== null && post.title === title && post.genre === genre && post.albumTitle === albumTitle && post.albumInfo === albumInfo;
    let postImgchange = null;
    
    if(post === null){
      throw new NotFoundException("게시물이 존재하지 않습니다.");
    }

    if(Body){
      throw new BadRequestException("게시물이 이미 존재합니다.");
    }

    if(post.userId !== userId){
      throw new NotFoundException("정보가 일치하지 않아 수정이 불가능합니다.");
    }

    if(file){
      postImgchange = await this.imageService.imageUploadS3(file);
    } else if(!file) {
      postImgchange = post.postImg;
    }

    await this.postsRepository.update(postId, {
      title,
      genre,
      lyrics,
      albumTitle,
      albumInfo,
      postImg : postImgchange
    })

    return { statusCode : 201, message : "게시물이 수정되었습니다." };
  }

  async remove(postId: number, userId : number) {
    const post = await this.postsRepository.findOne({ where : { postId }});
    
    if(post === null){
      throw new NotFoundException("게시물이 존재하지 않습니다.");
    }

    if(post.userId !== userId){
      throw new NotFoundException("정보가 일치하지 않아 삭제가 불가능합니다.");
    }

    await this.postsRepository.delete(postId);

    return { statusCode : 200, message : "게시물이 정상적으로 삭제되었습니다." };
  }
}
