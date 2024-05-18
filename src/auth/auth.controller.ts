import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register';
import { LoginDto } from './dto/login';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async create(@Body() registerDto: RegisterDto) {
    return await this.authService.create(registerDto);
  }

  @Post('/login')
  async login (@Body() loginDto : LoginDto){
    return await this.authService.login(loginDto);
  }

}
