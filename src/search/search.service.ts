import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Posts } from 'src/posts/entities/posts.entity';
import { Albums } from 'src/albums/entities/album.entity';

@Injectable()
export class SearchService {
    constructor(
        @InjectRepository(Posts) private postsRepository : Repository<Posts>,
        @InjectRepository(Albums) private albumRepository : Repository<Albums>,
    ){}

    // 노래 및 앨범 통합 검색
    async integration (page : number, page_size : number, title : string, singerName : string) {
        if(!page){
           page = 1;     
        }

        if(!page_size){
            page_size = 10;
        }

        let postWhere : Record<string, any> = {};
        let albumWhere : Record<string, any> = {};

        if(title){
            postWhere.title = Like(`%${title}%`);
            albumWhere.albumTitle = Like(`%${title}%`);
        }

        if(singerName){
            postWhere.singerName = Like(`%${singerName}%`);
            albumWhere.albumSingerName = Like(`%${singerName}%`);
        }

        const findPostAll = await this.postsRepository.find({
            where : postWhere,
            select : ['id', 'title', 'singerName'],
            skip : ((page - 1) * page_size),
            take : page_size
        });

        const findAlbumAll = await this.albumRepository.find({
            where : albumWhere,
            select : ['id', 'albumTitle', 'albumSingerName'],
            skip : ((page - 1) * page_size),
            take : page_size
        });
        
        if(findPostAll.length === 0 && findAlbumAll.length === 0){
            throw new NotFoundException("검색 결과가 존재하지 않습니다.");
        }

        const postTotal = await this.postsRepository.count({
            where : postWhere
            
        });

        const albumTotal = await this.albumRepository.count({
            where : albumWhere
        });

        const postPageRange = Math.ceil(postTotal / page_size);
        const albumPageRange = Math.ceil(albumTotal / page_size);

        return { statusCode : 201, message : "성공적으로 검색어 조회를 완료하였습니다.", data : { posts : { findPostAll, total : postTotal, pageRange : postPageRange }, albums : { findAlbumAll, total : albumTotal, pageRange : albumPageRange } } };
    }
}
