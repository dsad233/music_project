import { PickType } from '@nestjs/mapped-types';
import { RegisterDto } from '../../auth/dto/register';

export class UpdateUserDto extends PickType(RegisterDto, ['nickname', 'password', 'image', 'address', 'phoneNumber', 'isOpen']) {}
