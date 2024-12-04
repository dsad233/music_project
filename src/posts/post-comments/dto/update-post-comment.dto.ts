import { PickType } from '@nestjs/mapped-types';
import { CreatePostCommentDto } from './create-post-comment.dto';

export class UpdatePostCommentDto extends PickType(CreatePostCommentDto, ['context']) {}
