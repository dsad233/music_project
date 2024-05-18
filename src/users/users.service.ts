import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { UpdateUserDto } from './dto/UpdateUser';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { Repository } from 'typeorm';
import { compare, hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { ENV_PASSWORD_SALT } from 'src/const/keys';
import { DeleteUserDto } from './dto/DeleteUser';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(Users) private userRepository : Repository<Users>,
 private readonly configService : ConfigService){}

  async findAll() {
    const users = await this.userRepository.find();
    return users;
  }

  async findOne(userId : number) {
    const users = await this.userRepository.findOne({ where : { userId } });
    
    if(!users){
      throw new NotFoundException("유저가 존재하지 않습니다.");
    }

    return { statusCode : 200, message : "성공적으로 유저 상세조회를 하였습니다.", users};
  }

  async update(userId : number, updateUserDto: UpdateUserDto) {
    const users = await this.userRepository.findOne({ where : { userId } });
    const { password, image, nickname, address, phoneNumber, isOpen } = updateUserDto;
    const salt = this.configService.get<number>(ENV_PASSWORD_SALT);
    const hashPassword = await hash(password, Number(salt));

    if(!users){
      throw new NotFoundException("유저가 존재하지 않습니다.");
    }

    if(nickname === users.nickname || phoneNumber === users.phoneNumber){
      throw new NotFoundException("이미 존재하는 유저 입니다.");
    }

    const changeBoolean = Boolean(isOpen);

    const updateUser = this.userRepository.update(userId,{
      password : hashPassword,
      image,
      nickname,
      address,
      phoneNumber,
      isOpen : changeBoolean
    })

    return { statusCode : 201, message : "성공적으로 회원정보가 수정되었습니다.", updateUser };
  }

  async remove(userId: number, deleteUserDto : DeleteUserDto) {
    const users = await this.userRepository.findOne({ where : { userId } });
    const { password } = deleteUserDto;

    
    if(!users){
      throw new NotFoundException("유저가 존재하지 않습니다.");
    }

    if(!(await compare(password, users.password))){
      throw new BadRequestException("패스워드가 일치하지 않습니다.");
    }

    await this.userRepository.remove(users);
    
    return { statusCode : 201, message : "성공적으로 회원탈퇴가 되었습니다." };
  }
}
