import { PickType } from '@nestjs/mapped-types';
import { CreatePostDto } from './createPost.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Genres } from '../enum/genres';

export class UpdatePostDto extends PickType(CreatePostDto, [
  'title',
  'singerName',
  'genre',
  'lyrics',
  'releaseDate',
]) {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  singerName: string;

  @IsEnum(Genres)
  @IsOptional()
  genre: Genres;

  @IsString()
  @IsOptional()
  lyrics: string;

  @IsOptional()
  releaseDate: Date;

  @IsOptional()
  isOpen: boolean;
}
