import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Genres } from "../enum/genres";

export class CreatePostDto {
    @IsString()
    @IsNotEmpty({ message : "노래 제목을 기입해주세요." })
    title : string;

    @IsEnum(Genres)
    @IsNotEmpty({ message : "노래 장르를 기입해주세요." })
    genre : Genres;

    @IsString()
    @IsOptional()
    lyrics : string;

    @IsString()
    @IsNotEmpty({ message : "노래 앨범제목을 기입해주세요." })
    albumTitle : string;

    @IsString()
    @IsNotEmpty({ message : "앨범 소개란을 기입해주세요." })
    albumInfo : string;
}
