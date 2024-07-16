import { Controller, Post, Body, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register';
import { LoginDto } from './dto/login';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 유저 회원가입
  @Post('/register')
  @UseInterceptors(FileInterceptor('image'))
  async create(@Body() registerDto: RegisterDto, @UploadedFile() file: Express.Multer.File) {
    const authCreate = await this.authService.create(registerDto, file);
    return authCreate;
  }

  // 회원 로그인
  @Post('/login')
  async login (@Body() loginDto : LoginDto, @Res() res){
    const userToken = await this.authService.login(loginDto);
    res.cookie('access_Token', userToken);
    res.send("로그인 완료.");
  }
}
