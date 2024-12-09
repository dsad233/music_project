import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/updateUser';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';
import { Not, Repository } from 'typeorm';
import { compare, hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { ENV_PASSWORD_SALT } from 'src/const/keys';
import { DeleteUserDto } from './dto/deleteUser';
import { ImageService } from 'src/image/image.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(Users) private userRepository : Repository<Users>,
 private readonly configService : ConfigService,
 private readonly imageService : ImageService,
 @Inject(CACHE_MANAGER) private cacheManager : Cache
){}

  // 테스트 레디스 생성
  async testPost (title : string, context : string) {
    console.log("test : ",title);
    console.log(context);
    const set = await this.cacheManager.set(title, context);
    
    return set;
  }
  
  async testGet() {
    const testFind = await this.cacheManager.get('test');
    console.log(testFind)

    if(!testFind){
      throw new NotFoundException("존재하지 않음");
    }
    
    return testFind;
  }

  // 유저 전체 조회 (어드민만 가능)
  async findAll() {
    const userAll = await this.userRepository.find({ 
      select : ['id', 'email', 'nickname', 'phoneNumber', 'isOpen', 'createdAt', 'updatedAt', 'deletedAt']
    });

    return { statusCode : 200, message : "성공적으로 유저 전체 조회를 완료하였습니다.", data : userAll };
  }

  // 비공개된 유저들 전체 조회 (어드민만 가능)
  async findNotOpendList(){
    const findData = await this.userRepository.find({
      where : { isOpen : false, deletedAt : null },
      select : ['id', 'email', 'nickname', 'phoneNumber', 'isOpen', 'createdAt', 'updatedAt', 'deletedAt']
    }); 

    return { statusCode : 200, message : "성공적으로 비공개 유저 전체 조회를 완료하였습니다.", data : findData };
  }

  // 삭제 신청된 유저들 전체 조회 (어드민만 가능)
  async findDeletedList() {
    const findDeletedData = await this.userRepository.find({ 
      where : { deletedAt : Not(null) },
      select : ['id', 'email', 'nickname', 'phoneNumber', 'isOpen', 'createdAt', 'updatedAt', 'deletedAt']
    });

    return { statusCode : 200, message : "성공적으로 삭제 예정된 유저 전체 목록을 조회 완료하였습니다.", data : findDeletedData }
  }

  // 유저가 작성한 게시글 전체 조회 
  async findUsePost(id : number) {
    const findUseData = await this.userRepository.findOne({
      where : { id },
      relations : { posts : true, roles : true },
      select : {
        id : true,
        nickname : true,
        image : true,
        roles : {
          roleName : true
        },
        posts : {
          id : true,
          title : true,
          genre : true
        }
      }
    }); 

    if(!findUseData){
      throw new NotFoundException("유저가 존재하지 않습니다.");
    }

    return { statusCode : 200, message : "성공적으로 유저가 작성한 게시물 조회를 하였습니다.", data : findUseData };
  };

  // 유저 상세 목록 조회 (어드민만 가능)
  async findOne(id : number) {
    const users = await this.userRepository.findOne({ 
      where : { id },
      select : ['id', 'email', 'nickname', 'phoneNumber', 'isOpen', 'createdAt', 'updatedAt', 'deletedAt']
    });
    
    if(!users){
      throw new NotFoundException("유저가 존재하지 않습니다.");
    }
    
    if(id !== users.id){
      throw new BadRequestException("유저 정보가 일치하지 않습니다.");
    }

    return { statusCode : 200, message : "성공적으로 유저 상세조회를 하였습니다.", data : users };
  }

  // 유저 자기 정보 조회 (본인 회원만 가능)
  async myPage(id : number){
    const findUser = await this.userRepository.findOne({ 
      where : { id },
      select : ['id', 'email', 'image', 'nickname', 'address', 'phoneNumber', 'isOpen']
    });

    if(!findUser){
      throw new NotFoundException("유저가 존재하지 않습니다.");
    }

    return { statusCode : 200, message : "성공적으로 마이페이지 조회를 완료하였습니다.", data : findUser };
  }

  // 유저 정보 수정
  async update(id : number, users : Users, updateUserDto: UpdateUserDto, file : Express.Multer.File) {
    const findUser = await this.userRepository.findOne({ where : { id } });
    const { password, passwordConfirm, nickname, address, phoneNumber, isOpen } = updateUserDto;
    const userName = await this.userRepository.findOne({ where : { nickname }});
    const userPhone = await this.userRepository.findOne({ where : { phoneNumber }});
    const phoneNumberRegex = /^\d{3}-\d{4}-\d{4}$/;
    const salt = this.configService.get<number>(ENV_PASSWORD_SALT);
    const hashPassword = await hash(password, Number(salt));
    let imageChange = null;

    if(!findUser){
      throw new NotFoundException("유저가 존재하지 않습니다.");
    }

    if(password !== passwordConfirm){
      throw new BadRequestException("패스워드 확인란을 다시 입력해주세요.");
    }

    if(userName !== null && nickname === userName.nickname){
      throw new BadRequestException("이미 존재하는 닉네임 입니다.");
    }

    if(phoneNumber && !phoneNumberRegex.test(phoneNumber)){
      throw new BadRequestException("정상적인 핸드폰 번호를 입력해주세요.");
    }

    if(userPhone !== null && phoneNumber === userPhone.phoneNumber){
      throw new BadRequestException("이미 존재하는 휴대폰 번호 입니다.");
    }

    if(id !== users.id){
      throw new BadRequestException("유저 정보가 일치하지 않습니다.");
    }

    if(file){
      imageChange = await this.imageService.imageUploadS3(file);
    } else {
      imageChange = users.image;
    }

    const changeBoolean = Boolean(isOpen);

    await this.userRepository.update(id,{
      password : hashPassword,
      image : imageChange,
      nickname,
      address,
      phoneNumber,
      isOpen : changeBoolean
    })

    return { statusCode : 201, message : "성공적으로 회원정보가 수정되었습니다." };
  }

  // 유저 회원 탈퇴
  async remove(id: number, users : Users, deleteUserDto : DeleteUserDto) {
    const findUser = await this.userRepository.findOne({ where : { id } });
    const { password } = deleteUserDto;

    
    if(!findUser){
      throw new NotFoundException("유저가 존재하지 않습니다.");
    }

    if(id !== users.id){
      throw new BadRequestException("유저 정보가 일치하지 않습니다.");
    }

    if(!(await compare(password, findUser.password))){
      throw new BadRequestException("패스워드가 일치하지 않습니다.");
    }

    await this.userRepository.remove(findUser);
    
    return { statusCode : 201, message : "성공적으로 회원탈퇴가 완료되었습니다." };
  }

  // 임시 회원 탈퇴 (회원만 가능)
  async softDelete(id : number, deleteUserDto : DeleteUserDto){
    const findData = await this.userRepository.findOne({ 
      where : { id, deletedAt : null },
      select : ['id', 'password']
    });

    if(!findData){
      throw new NotFoundException("유저가 존재하지 않습니다.");
    }
    
    const { password } = deleteUserDto;

    if(!(await compare(password, findData.password))){
      throw new BadRequestException("패스워드가 일치하지 않습니다.");
    }

    await this.userRepository.update(id,{
      deletedAt : new Date()
    });
    
    return { statusCode : 201, message : "성공적으로 회원탈퇴가 완료되었습니다." };
  }
}
