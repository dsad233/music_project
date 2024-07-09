import { PickType } from '@nestjs/mapped-types';
import { RegisterDto } from '../../auth/dto/register';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PickType(RegisterDto, ['nickname', 'password', 'address', 'phoneNumber', 'isOpen']) {

    @IsString()
    @IsOptional()
    nickname : string;

    @IsString()
    @IsOptional()
    password : string;

    @IsString()
    @IsOptional()
    address : string;

    @IsString()
    @IsOptional()
    phoneNumber : string;

    @IsOptional()
    isOpen : boolean;
}
