import { PickType } from '@nestjs/mapped-types';
import { RegisterDto } from '../../auth/dto/register';

export class DeleteUserDto extends PickType(RegisterDto, ['password']) {}
