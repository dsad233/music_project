import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Genres } from "../enum/genres";

export class CreatePostDto {
    @IsString()
    @IsNotEmpty({ message : "노래 제목란을 기입해주세요." })
    title : string;

    @IsString()
    @IsNotEmpty({ message : "가수 명란을 기입해주세요." })
    singerName : string;

    @IsEnum(Genres, { each : true, message : "올바른 장르란을 기입해주세요." })
    genre : Genres;

    @IsString()
    @IsOptional()
    lyrics : string;

    @IsOptional()
    releaseDate : Date;

    @IsOptional()
    isOpen : boolean;
}
