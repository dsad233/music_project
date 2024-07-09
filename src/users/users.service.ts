import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/updateUser';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { Repository } from 'typeorm';
import { compare, hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { ENV_PASSWORD_SALT } from 'src/const/keys';
import { DeleteUserDto } from './dto/deleteUser';
import { ImageService } from 'src/image/image.service';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(Users) private userRepository : Repository<Users>,
 private readonly configService : ConfigService,
 private readonly imageService : ImageService){}

  async findAll() {
    const userAll = await this.userRepository.find();
    return userAll;
  }

  async findOne(userId : number) {
    const users = await this.userRepository.findOne({ where : { userId } });
    
    if(!users){
      throw new NotFoundException("유저가 존재하지 않습니다.");
    }
    
    if(userId !== users.userId){
      throw new BadRequestException("유저 정보가 일치하지 않습니다.");
    }

    return { statusCode : 200, message : "성공적으로 유저 상세조회를 하였습니다.", users};
  }

  async update(userId : number, users : Users, updateUserDto: UpdateUserDto, file : Express.Multer.File) {
    const findUser = await this.userRepository.findOne({ where : { userId } });
    const { password, nickname, address, phoneNumber, isOpen } = updateUserDto;
    const salt = this.configService.get<number>(ENV_PASSWORD_SALT);
    const hashPassword = await hash(password, Number(salt));
    let imageChange = null;

    if(!findUser){
      throw new NotFoundException("유저가 존재하지 않습니다.");
    }

    if(nickname && nickname === findUser.nickname){
      throw new NotFoundException("이미 존재하는 닉네임 입니다.");
    }

    if(phoneNumber && phoneNumber === findUser.phoneNumber){
      throw new NotFoundException("이미 존재하는 휴대폰 번호 입니다.");
    }

    if(userId !== users.userId){
      throw new BadRequestException("유저 정보가 일치하지 않습니다.");
    }

    if(file){
      imageChange = await this.imageService.imageUploadS3(file);
    } else {
      imageChange = users.image;
    }

    const changeBoolean = Boolean(isOpen);

    await this.userRepository.update(userId,{
      password : hashPassword,
      image : imageChange,
      nickname,
      address,
      phoneNumber,
      isOpen : changeBoolean
    })

    return { statusCode : 201, message : "성공적으로 회원정보가 수정되었습니다." };
  }

  async remove(userId: number, users : Users, deleteUserDto : DeleteUserDto) {
    const findUser = await this.userRepository.findOne({ where : { userId } });
    const { password } = deleteUserDto;

    
    if(!findUser){
      throw new NotFoundException("유저가 존재하지 않습니다.");
    }

    if(userId !== users.userId){
      throw new BadRequestException("유저 정보가 일치하지 않습니다.");
    }

    if(!(await compare(password, findUser.password))){
      throw new BadRequestException("패스워드가 일치하지 않습니다.");
    }

    await this.userRepository.remove(findUser);
    
    return { statusCode : 201, message : "성공적으로 회원탈퇴가 완료되었습니다." };
  }
}
