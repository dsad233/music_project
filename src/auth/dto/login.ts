import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto{
    @IsString()
    @IsNotEmpty({ message : "이메일을 입력하세요." })
    email : string;

    @IsString()
    @IsNotEmpty({ message : "패스워드를 입력하세요."})
    password : string;
}
