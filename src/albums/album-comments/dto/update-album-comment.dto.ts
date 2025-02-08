import { PickType } from '@nestjs/mapped-types';
import { CreateAlbumCommentDto } from './create-album-comment.dto';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateAlbumCommentDto extends PickType(CreateAlbumCommentDto, ['context']) {
    @IsString()
    @IsNotEmpty({ message : "댓글 내용이 누락되었습니다." })
    @MinLength(2, { message: "댓글은 최소 2자 이상이어야 합니다." })
    context : string;
}
