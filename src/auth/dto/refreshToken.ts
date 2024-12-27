import { IsNotEmpty, IsString } from "class-validator";

export class RefreshToken {
    @IsString()
    @IsNotEmpty({ message : "이메일을 입력하세요."})
    email : string;

    @IsString()
    @IsNotEmpty({ message : "토큰을 입력하세요."})
    token : string;
}