import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateUserDto } from './dto/updateUser';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';
import { Repository } from 'typeorm';
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

  // 유저 전체 조회 (어드민만 가능)
  async findAll(page : number, page_size : number) {
    if(!page){
      page = 1;
    }

    if(!page_size){
      page_size = 10;
    }

    const userAll = await this.userRepository.find({ 
      withDeleted : true,
      select : ['id', 'email', 'nickname', 'phoneNumber', 'isOpen', 'createdAt', 'updatedAt', 'deletedAt'],
      skip : ((page - 1) * page_size),
      take : page_size
    });

    if(userAll && userAll.length === 0){
      throw new NotFoundException("유저들이 존재하지 않습니다.");
    }

    return { statusCode : 200, message : "성공적으로 유저 전체 조회를 완료하였습니다.", data : userAll };
  }

  // 비공개된 유저들 전체 조회 (어드민만 가능)
  async findNotOpendList(){
    const findData = await this.userRepository.find({
      where : { isOpen : false },
      select : ['id', 'email', 'nickname', 'phoneNumber', 'isOpen', 'createdAt', 'updatedAt', 'deletedAt']
    }); 
  
    if(findData && findData.length === 0){
      throw new NotFoundException("비공개 유저들이 존재하지 않습니다.");
    }

    return { statusCode : 200, message : "성공적으로 비공개 유저 전체 조회를 완료하였습니다.", data : findData };
  }

  // 삭제 신청된 유저들 전체 조회 (어드민만 가능)
  async findDeletedList() {
    const findDeletedData = await this.userRepository.createQueryBuilder('users')
    .withDeleted()
    .where('users.deletedAt IS NOT NULL')
    .getMany();

    if(findDeletedData && findDeletedData.length === 0){
      throw new NotFoundException("삭제 신청된 유저들이 존재하지 않습니다.");
    }

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
      withDeleted : true,
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
    const findUser = await this.userRepository.findOne({ where : { id }, withDeleted : true });
    const { password, passwordConfirm, nickname, address, phoneNumber, isOpen } = updateUserDto;
    const userName = await this.userRepository.findOne({ where : { nickname }, withDeleted : true });
    const userPhone = await this.userRepository.findOne({ where : { phoneNumber }, withDeleted : true });
    const phoneNumberRegex = /^\d{3}-\d{4}-\d{4}$/;
    const salt = this.configService.getOrThrow<number>(ENV_PASSWORD_SALT);
    const hashPassword = await hash(password, Number(salt));
    let imageChange = null;

    if(!findUser){
      throw new NotFoundException("유저가 존재하지 않습니다.");
    }

    if(await compare(password, findUser.password)) {
      throw new BadRequestException("전과 동일한 패스워드를 입력하였습니다.");
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

    const changeNickname = nickname ? nickname : users.nickname;
    const changeAddress = address ? address : users.address;
    const changePhoneNumber = phoneNumber ? phoneNumber : users.phoneNumber;
    const changeBoolean = isOpen !== null ? isOpen : users.isOpen;

    await this.userRepository.update(id,{
      password : hashPassword,
      image : imageChange,
      nickname : changeNickname,
      address : changeAddress,
      phoneNumber : changePhoneNumber,
      isOpen : changeBoolean
    })

    return { statusCode : 201, message : "성공적으로 회원정보가 수정되었습니다." };
  }

  // 유저 회원 탈퇴
  async remove(id: number, deleteUserDto : DeleteUserDto) {
    const findUser = await this.userRepository.findOne({ where : { id }, withDeleted : true });
    const { password } = deleteUserDto;

    
    if(!findUser){
      throw new NotFoundException("유저가 존재하지 않습니다.");
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
      where : { id },
      select : ['id', 'password']
    });

    if(!findData){
      throw new NotFoundException("유저가 존재하지 않습니다.");
    }

    if(findData.id !== id){
      throw new UnauthorizedException("유저 정보가 일치하지 않아 삭제가 불가능합니다.");
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
