import { PartialType } from '@nestjs/mapped-types';
import { CreateYoutubeServiceDto } from './create-youtube-service.dto';

export class UpdateYoutubeServiceDto extends PartialType(CreateYoutubeServiceDto) {}
