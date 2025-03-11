import { Module } from '@nestjs/common';
import { TokenVerifyService } from './token.verify.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports : [JwtModule],
  providers: [TokenVerifyService],
  exports : [TokenVerifyService]
})

export class TokenVerifyModule {}
