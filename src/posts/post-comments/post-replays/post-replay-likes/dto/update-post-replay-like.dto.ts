import { PartialType } from '@nestjs/mapped-types';
import { CreatePostReplayLikeDto } from './create-post-replay-like.dto';

export class UpdatePostReplayLikeDto extends PartialType(CreatePostReplayLikeDto) {}
