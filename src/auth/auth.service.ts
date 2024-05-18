import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register';
import { ENV_PASSWORD_SALT } from 'src/const/keys';
import { LoginDto } from './dto/login';
import { compare, hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(Users) private userRepository : Repository<Users>,
  private readonly configService : ConfigService,
  private readonly jwtService : JwtService
){}
  async create(registerDto: RegisterDto) {
    const { email, password, passwordConfirm, image, nickname, address, phoneNumber, isOpen } = registerDto;
    const userEmail = await this.userRepository.findOne({ where : { email }});
    const userName = await this.userRepository.findOne({ where : { nickname }});
    const userPhone = await this.userRepository.findOne({ where : { phoneNumber }});
    const phoneNumberRegex = /^\d{3}-\d{4}-\d{4}$/;
    const salt = this.configService.get<number>(ENV_PASSWORD_SALT);
    const hashPassword = await hash(password, Number(salt));

    if(userEmail !== null && email === userEmail.email){
      throw new BadRequestException("이미 존재하는 유저입니다.");
    }

    if(!email.includes("@naver.com") &&
    !email.includes("@daum.net") &&
    !email.includes("@google.com") &&
    !email.includes("@gmail.com") &&
    !email.includes("@googlemail.com") &&
    !email.includes("@hanmail.net") &&
    !email.includes("@icloud.com") &&
    !email.includes("@cyworld.com") &&
    !email.includes("@kakao.com") &&
    !email.includes("@mail.com") &&
    !email.includes("@narasarang.or.kr") &&
    !email.includes("@tistory.com")){
      throw new BadRequestException("이메일 형식이 알맞지 않습니다.");
    }

    if(password !== passwordConfirm){
      throw new BadRequestException("패스워드 확인란을 다시 입력해주세요.");
    }

    if(userName !== null && nickname === userName.nickname){
      throw new BadRequestException("이미 존재하는 닉네임입니다.");
    }

    if( phoneNumber && !phoneNumberRegex.test(phoneNumber)){
      throw new BadRequestException("정상적인 핸드폰 번호를 입력해주세요.");
    }
    
    if(userPhone !== null && phoneNumber === userPhone.phoneNumber){
      throw new BadRequestException("이미 등록된 핸드폰 번호입니다.");
    }
    
    const changeBoolean = Boolean(isOpen);

    const user_save = this.userRepository.create({
      email,
      password : hashPassword,
      image,
      nickname,
      address,
      phoneNumber,
      isOpen : changeBoolean
    });

    await this.userRepository.save(user_save);

    return { statusCode : 201, message : "성공적으로 회원가입이 완료되었습니다.", user_save };
  }

  async login (loginDto : LoginDto){
    const { email, password } = loginDto;
    const users = await this.userRepository.findOne({ where : { email },
    select : ['userId', 'email', 'password'] 
  });
    
    if(!users){
      throw new NotFoundException("유저가 존재하지 않습니다.");
    }

    if(!(await compare(password, users.password))){
      throw new BadRequestException("패스워드가 일치하지 않습니다.");
    }

    const payload = { email, sub : users.userId };
    return {
      accessToken : this.jwtService.sign(payload)
    };
  }

  async findEmail(email : string){
    const users = await this.userRepository.findOne({ where : { email } });

    if(!users){
      throw new NotFoundException("유저가 존재하지 않습니다.");
    }
    
    return users;
  }
}
