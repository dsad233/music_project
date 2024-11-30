import { IsNotEmpty, IsString } from "class-validator";

export class CreatePostCommentDto {
    @IsString()
    @IsNotEmpty({ message : "댓글 내용이 누락되었습니다." })
    context : string;
}
