import { PickType } from '@nestjs/mapped-types';
import { RegisterDto } from '../../auth/dto/register';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PickType(RegisterDto, [
  'nickname',
  'password',
  'address',
  'phoneNumber',
  'isOpen',
]) {
  @IsString()
  @IsOptional()
  nickname: string;

  @IsString()
  @IsNotEmpty({ message: '패스워드 란을 입력해 주세요.' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '패스워드 확인란을 입력해 주세요.' })
  passwordConfirm: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsString()
  @IsOptional()
  phoneNumber: string;

  @IsOptional()
  isOpen: boolean;
}
