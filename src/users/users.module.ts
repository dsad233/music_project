import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';
import { ImageModule } from 'src/image/image.module';
import { UserInfos } from './entities/userInfos.entity';
import { TokenVerifyModule } from 'src/tokenverify/token.verify.module';

@Module({
  imports: [
    ImageModule,
    TokenVerifyModule,
    TypeOrmModule.forFeature([Users, UserInfos]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
