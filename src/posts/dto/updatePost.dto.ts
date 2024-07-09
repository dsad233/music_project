import { PickType } from '@nestjs/mapped-types';
import { CreatePostDto } from './createPost.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Genres } from '../enum/genres';

export class UpdatePostDto extends PickType(CreatePostDto, ['title', 'genre', 'lyrics', 'albumTitle', 'albumInfo']) {

    @IsString()
    @IsOptional()
    title : string;

    @IsEnum(Genres)
    @IsOptional()
    genre : Genres;

    @IsString()
    @IsOptional()
    lyrics : string;

    @IsString()
    @IsOptional()
    albumTitle : string;

    @IsString()
    @IsOptional()
    albumInfo : string;

}
