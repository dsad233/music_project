import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class RegisterDto {
    
    @IsString()
    @IsNotEmpty({ message : "이메일을 입력해주세요." })
    email : string;

    @IsString()
    @IsNotEmpty({ message : "패스워드를 입력해주세요." })
    password : string;

    @IsString()
    @IsNotEmpty({ message : "패스워드 확인란을 입력해주세요." })
    passwordConfirm : string;

    @IsString()
    @IsOptional()
    image : string;

    @IsString()
    @IsNotEmpty({ message : "닉네임을 입력해주세요." })
    nickname : string;

    @IsString()
    @IsNotEmpty({ message : "주소를 입력해주세요." })
    address : string;

    @IsString()
    @IsOptional()
    phoneNumber : string;

    @IsOptional()
    isOpen : boolean;
    
}
