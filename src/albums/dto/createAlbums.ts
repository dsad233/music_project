import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Genres } from "src/posts/enum/genres";

export class CreateAlbumDto {

    @IsOptional()
    albumNumbering : number;

    @IsString()
    @IsNotEmpty({ message : "노래 앨범제목란을 기입해주세요." })
    albumTitle : string;

    @IsString()
    @IsNotEmpty({ message : "가수 명란을 기입해주세요." })
    albumSingerName : string;

    @IsString()
    @IsNotEmpty({ message : "앨범 소개란을 기입해주세요." })
    albumInfo : string;

    @IsEnum(Genres, { message : "올바른 장르란을 기입해주세요." })
    albumGenre : Genres;

    @IsOptional()
    albumRelease : Date;
}
