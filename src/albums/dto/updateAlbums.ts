import { PickType } from '@nestjs/mapped-types';
import { CreateAlbumDto } from './createAlbums';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Genres } from 'src/posts/enum/genres';

export class UpdateAlbumDto extends PickType(CreateAlbumDto, ['albumTitle', 'albumSingerName', 'albumInfo', 'albumGenre', 'albumRelease', 'isOpen']) {
    @IsString()
    @IsOptional()
    albumTitle : string

    @IsString()
    @IsOptional()
    albumSingerName : string;

    @IsString()
    @IsOptional()
    albumInfo : string;

    @IsEnum(Genres)
    @IsOptional()
    albumGenre : Genres;

    @IsString()
    @IsOptional()
    albumRelease : Date;

    @IsOptional()
    isOpen: boolean;
}
