import { PickType } from '@nestjs/mapped-types';
import { CreatePostReplayDto } from './create-post-replay.dto';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePostReplayDto extends PickType(CreatePostReplayDto, ['context']) {
    @IsString()
    @IsNotEmpty({ message : "대댓글 내용이 누락되었습니다." })
    @MinLength(2, { message: "대댓글은 최소 2자 이상이어야 합니다." })
    context : string;
}
