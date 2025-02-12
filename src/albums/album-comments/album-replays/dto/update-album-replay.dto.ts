import { PickType } from '@nestjs/mapped-types';
import { CreateAlbumReplayDto } from './create-album-replay.dto';

export class UpdateAlbumReplayDto extends PickType(CreateAlbumReplayDto, ['context']) {}
