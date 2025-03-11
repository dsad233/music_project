import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateUserDto } from './dto/updateUser';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';
import { Like, Repository } from 'typeorm';
import { compare, hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { ENV_PASSWORD_SALT } from 'src/const/keys';
import { DeleteUserDto } from './dto/deleteUser';
import { ImageService } from 'src/image/image.service';
import { UserInfos } from './entities/userInfos.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { TokenVerifyService } from 'src/tokenverify/token.verify.service';

@Injectable()
export class UsersService {
  constructor(
  @InjectRepository(Users) private userRepository : Repository<Users>,
  @InjectRepository(UserInfos) private userInfosRepository : Repository<UserInfos>,
  private readonly configService : ConfigService,
  private readonly imageService : ImageService,
  private readonly tokenVerifyService : TokenVerifyService,
  @Inject(CACHE_MANAGER) private cacheManager : Cache
){}

  // 유저 전체 조회 (어드민만 가능)
  async findAll(page : number, page_size : number, email : string, nickname : string, phoneNumber : string) {
    if(!page){
      page = 1;
    }

    if(!page_size){
      page_size = 10;
    }

    let where : Record<string, any> = { isOpen : true };

    if(email){
      where.email = Like(`%${email}%`);
    }

    if(nickname){
      where.nickname = Like(`%${nickname}%`);
    }

    if(phoneNumber){
      where.phoneNumber = Like(`%${phoneNumber}%`);
    }

    const userAll = await this.userRepository.find({ 
      where,
      relations : { userInfos : true },
      select : { 
        id : true,
        email : true,
        nickname : true,
        isOpen : true,
        createdAt : true,
        updatedAt : true,
        deletedAt : true,
        userInfos : {
          address : true,
          phoneNumber : true
        }
       },
      skip : ((page - 1) * page_size),
      take : page_size
    });

    if(userAll && userAll.length === 0){
      throw new NotFoundException("유저들이 존재하지 않습니다.");
    }

    const total = await this.userRepository.count({
      where
    });

    const pageRange = Math.ceil(total / page_size);

    return { statusCode : 200, message : "성공적으로 유저 전체 조회를 완료하였습니다.", total : total, pageRange : pageRange, data : userAll };
  }

  // 비공개된 유저들 전체 조회 (어드민만 가능)
  async findNotOpendList(page : number, page_size : number, email : string, nickname : string, phoneNumber : string){
    if(!page){
      page = 1;
    }

    if(!page_size){
      page_size = 10;
    }

    let where : Record<string, any> = { isOpen : false };

    if(email){
      where.email = Like(`%${email}%`);
    }

    if(nickname){
      where.nickname = Like(`%${nickname}%`);
    }

    if(phoneNumber){
      where.phoneNumber = Like(`%${phoneNumber}%`);
    }

    const findData = await this.userRepository.find({
      where,
      relations : { userInfos : true },
      select : {
        id : true,
        email : true,
        nickname : true,
        isOpen : true,
        createdAt : true,
        updatedAt : true,
        userInfos : {
          address : true,
          phoneNumber : true
        }
      },
      skip : ((page - 1) * page_size),
      take : page_size
    }); 
  
    if(findData && findData.length === 0){
      throw new NotFoundException("비공개 유저들이 존재하지 않습니다.");
    }

    const total = await this.userRepository.count({
      where
    });

    const pageRange = Math.ceil(total / page_size);

    return { statusCode : 200, message : "성공적으로 비공개 유저 전체 조회를 완료하였습니다.", total : total, pageRange : pageRange, data : findData };
  }

  // 삭제 신청된 유저들 전체 조회 (어드민만 가능)
  async findDeletedList(page : number, page_size : number, email : string, nickname : string, phoneNumber : string) {
    if(!page){
      page = 1;
    }

    if(!page_size){
      page_size = 10;
    }

    const findDeletedData = this.userRepository.createQueryBuilder('users')
    .withDeleted()
    .where('users.deletedAt IS NOT NULL')
    .innerJoin('users.userInfos', 'userInfos')
    .select([
      'users.id', 
      'users.email', 
      'users.nickname', 
      'users.isOpen', 
      'users.createdAt', 
      'users.updatedAt', 
      'users.deletedAt',
      'userInfos.address',
      'userInfos.phoneNumber'
    ])
    
    if(email){
      findDeletedData.andWhere('users.email LIKE :email', { email : `%${email}%` });
    }

    if(nickname){
      findDeletedData.andWhere('users.nickname LIKE :nickname', { nickname : `%${nickname}%` });
    }

    if(phoneNumber){
      findDeletedData.andWhere('userInfos.phoneNumber LIKE :phoneNumber', { phoneNumber : `%${phoneNumber}%` });
    }

    const offset = ((page - 1) * page_size);

    const [result, total] = await findDeletedData.skip(offset).take(page_size).getManyAndCount();

    if(result && result.length === 0){
      throw new NotFoundException("삭제 신청된 유저들이 존재하지 않습니다.");
    }

    const pageRange = Math.ceil(total / page_size);

    return { statusCode : 200, message : "성공적으로 삭제 예정된 유저 전체 목록을 조회 완료하였습니다.", total : total, pageRange : pageRange, data : result }
  }

  // 유저 상세 목록 조회 (어드민만 가능)
  async findOne(id : number) {
    const users = await this.userRepository.findOne({ 
      where : { id },
      relations : { userInfos : true },
      select : {
        id : true,
        email : true,
        nickname : true,
        isOpen : true,
        createdAt : true,
        updatedAt : true,
        deletedAt : true,
        userInfos : {
          address : true,
          phoneNumber : true 
        }
      }
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
  async myPage(refreshToken : string, id : number, userIp : string, userAgent : string){
    await this.tokenVerifyService.verifyRefreshToken(refreshToken, userIp, userAgent, id);
    const findUser = await this.userRepository.findOne({ 
      where : { id },
      relations : { userInfos : true },
      select : {
        id : true,
        email : true,
        nickname : true,
        isOpen : true,
        userInfos : {
          image : true,
          address : true,
          phoneNumber : true
        }
      }
    });

    if(!findUser){
      throw new NotFoundException("유저가 존재하지 않습니다.");
    }

    return { statusCode : 200, message : "성공적으로 마이페이지 조회를 완료하였습니다.", data : findUser };
  }

  // 유저 정보 수정
  async update(refreshToken : string, users : Users, userIp : string, userAgent : string, updateUserDto: UpdateUserDto, file : Express.Multer.File) {
    await this.tokenVerifyService.verifyRefreshToken(refreshToken, userIp, userAgent, users.id);
    const findUser = await this.userRepository.findOne({ where : { id : users.id }, withDeleted : true, select : ['id']  });

    if(!findUser){
      throw new NotFoundException("유저가 존재하지 않습니다.");
    }

    if(findUser.id !== users.id){
      throw new BadRequestException("유저 정보가 일치하지 않아 수정이 불가능합니다.");
    }

    const { password, passwordConfirm, nickname, address, phoneNumber, isOpen } = updateUserDto;
    const userName = await this.userRepository.findOne({ where : { nickname }, withDeleted : true, select : ['nickname'] });
    const userPhone = await this.userInfosRepository.findOne({ where : { phoneNumber }, withDeleted : true, select : ['phoneNumber'] });
    const phoneNumberRegex = /^\d{3}-\d{4}-\d{4}$/;
    const salt = this.configService.getOrThrow<number>(ENV_PASSWORD_SALT);
    const hashPassword = await hash(password, Number(salt));
    let imageChange = null;

    if(await compare(password, users.password)) {
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

    if(file){
      imageChange = await this.imageService.imageUploadS3(file);
    } else {
      imageChange = users.userInfos.image;
    }

    const changeNickname = nickname ? nickname : users.nickname;
    const changeAddress = address ? address : users.userInfos.address;
    const changePhoneNumber = phoneNumber ? phoneNumber : users.userInfos.phoneNumber;
    const changeBoolean = isOpen !== null ? isOpen : users.isOpen;

    await this.userRepository.update(users.id,{
      password : hashPassword,
      nickname : changeNickname,
      isOpen : changeBoolean
    });

    await this.userInfosRepository.update(users.id, {
      address : changeAddress,
      phoneNumber : changePhoneNumber,
      image : imageChange,
    });

    return { statusCode : 201, message : "성공적으로 회원정보가 수정되었습니다." };
  }

  // 유저 회원 탈퇴 (어드민 전용)
  async remove(id: number) {
    const findUser = await this.userRepository.findOne({ where : { id }, withDeleted : true, select : ['id'] });
    
    if(!findUser){
      throw new NotFoundException("유저가 존재하지 않습니다.");
    }

    await this.userRepository.remove(findUser);

    const removeCacheData = await this.cacheManager.store.keys(`userAgent:${id}:*`);

    if(removeCacheData){
      const promiseRemove = removeCacheData.map(async (data) => {
        try {
           await this.cacheManager.del(data);
        } catch(err){
          console.error(err);
          throw new InternalServerErrorException("유저의 캐쉬 삭제 오류 발생.");
        }
      });
  
      await Promise.all(promiseRemove);
    }
    
    return { statusCode : 201, message : "성공적으로 회원탈퇴가 완료되었습니다." };
  }

  // 임시 회원 탈퇴 (회원만 가능)
  async softDelete(refreshToken : string, id : number, userIp : string, userAgent : string, deleteUserDto : DeleteUserDto){
    await this.tokenVerifyService.verifyRefreshToken(refreshToken, userIp, userAgent, id);
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

    await this.cacheManager.del(`userAgent:${id}:${userIp}:${userAgent}`);
    
    return { statusCode : 201, message : "성공적으로 회원탈퇴가 완료되었습니다." };
  }
}
