import { Controller, Post, Body, UseInterceptors, UploadedFile, Res, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register';
import { LoginDto } from './dto/login';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

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
    const { accessToken, refreshToken } = await this.authService.login(loginDto);
    res.cookie('accessToken', accessToken, { httpOnly : true, secure : true, sameSite : 'lax', maxAge : 3600000 });
    res.cookie('refreshToken', refreshToken, { httpOnly : true, secure : true, sameSite : 'lax', maxAge : 3600000 });
    return res.status(200).json({ statusCode : 200, message : "로그인 완료.", accessToken : accessToken, refreshToken : refreshToken });
  }

  // // 리프레쉬 토큰 발급 (액세스 토큰이 유효할 때)
  // @UseGuards(AuthGuard('jwt'))
  // @Post('/refresh')
  // async refreshToken(@Body('refreshToken') refreshToken : RefreshToken){
  //   const refresh = await this.authService.refreshToken(refreshToken);
  //   return refresh;
  // }

  // 리프레쉬 토큰 재발급 (리프레쉬 토큰만이 존재할 때)
  @Post('/refresh-retry')
  async refresh(@Res() res : Response, @Req() req : Request) {
    const headerGetToken = req.cookies["refreshToken"];
    const { accessToken, refreshToken } = await this.authService.refreshTokenRetry(headerGetToken);
    res.cookie('accessToken', accessToken, { httpOnly : true, secure : true, sameSite : 'lax', maxAge : 3600000 });
    res.cookie('refreshToken', refreshToken, { httpOnly : true, secure : true, sameSite : 'lax', maxAge : 3600000 });
    return res.status(201).json({ statusCode : 201, message : "토큰 재발급 완료.", accessToken : accessToken, refreshToken : refreshToken });
  }

  // 로그아웃
  @UseGuards(AuthGuard('jwt'))
  @Post('/logout')
  async logout(@Res() res : Response) {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    });
    return res.status(201).json({ statusCode : 201, message : "로그아웃 완료." });
  }
}
