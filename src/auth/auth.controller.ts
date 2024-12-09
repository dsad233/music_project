import { Controller, Post, Body, UseInterceptors, UploadedFile, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register';
import { LoginDto } from './dto/login';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

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
  async login (@Body() loginDto : LoginDto, @Res() res : Response){
    const userToken = await this.authService.login(loginDto);
    res.cookie('access_Token', userToken, { httpOnly : true, secure : true, sameSite : 'lax', maxAge : 3600000 });
    res.send("로그인 완료.");
  }

  // // 리프레쉬 토큰
  // @Post('/refreshtoken')
  // async refresh(){
    
  // }


  // 로그아웃
  @UseGuards(AuthGuard('jwt'))
  @Post('/logout')
  async logout(@Res() res : Response) {
    res.clearCookie('access_Token');
    res.send("로그아웃 완료.");
  }
}
