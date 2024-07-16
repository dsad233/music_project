import { PickType } from '@nestjs/mapped-types';
import { CreateAlbumDto } from './createAlbums';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Genres } from 'src/posts/enum/genres';

export class UpdateAlbumDto extends PickType(CreateAlbumDto, ['albumTitle', 'albumSingerName', 'albumInfo', 'albumGenre', 'albumRelease']) {
    @IsString()
    albumTitle : string

    @IsString()
    albumSingerName : string;

    @IsString()
    @IsOptional()
    albumInfo : string;

    @IsEnum(Genres)
    albumGenre : Genres;

    @IsString()
    @IsOptional()
    albumRelease : Date;
}
