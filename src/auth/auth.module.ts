import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ENV_JWT_SECRET_KEY } from 'src/const/keys';
import { Users } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './strategy/Jwt.Strategy';
import { ImageModule } from 'src/image/image.module';

@Module({
  imports : [
   PassportModule.register({ defaultStrategy : 'jwt' }),
   JwtModule.registerAsync({
    imports : [ConfigModule],
    inject : [ConfigService],
    useFactory : (configService : ConfigService) => ({
      secret : configService.get<string>(ENV_JWT_SECRET_KEY),
      signOptions : {
        expiresIn : '12h'
      }
    })
   }),
   TypeOrmModule.forFeature([Users]),
   ImageModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports : [AuthService]
})
export class AuthModule {}
