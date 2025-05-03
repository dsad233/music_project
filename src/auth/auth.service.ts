import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/users/entities/users.entity';
import { DataSource, Repository } from 'typeorm';
import { RegisterDto } from './dto/register';
import {
  ENV_PASSWORD_SALT,
  ENV_REFRESH_SECRET_KEY,
} from 'src/utils/const/keys';
import { LoginDto } from './dto/login';
import { compare, hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError, JsonWebTokenError } from '@nestjs/jwt';
import { ImageService } from 'src/image/image.service';
import { Roles } from 'src/users/entities/roles.entity';
import { UserInfos } from 'src/users/entities/userInfos.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users) private userRepository: Repository<Users>,
    @InjectRepository(UserInfos)
    private userInfosRepository: Repository<UserInfos>,
    @InjectRepository(Roles) private rolesRepository: Repository<Roles>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly imageService: ImageService,
    private dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // 유저 회원가입
  async create(registerDto: RegisterDto, file: Express.Multer.File) {
    const {
      email,
      password,
      passwordConfirm,
      nickname,
      address,
      phoneNumber,
      isOpen,
    } = registerDto;
    const userEmail = await this.userRepository.findOne({
      where: { email },
      withDeleted: true,
      select: ['email'],
    });
    const userName = await this.userRepository.findOne({
      where: { nickname },
      withDeleted: true,
      select: ['nickname'],
    });
    const userPhone = await this.userInfosRepository.findOne({
      where: { phoneNumber },
      withDeleted: true,
      select: ['phoneNumber'],
    });
    const phoneNumberRegex = /^\d{3}-\d{4}-\d{4}$/;
    const salt = this.configService.getOrThrow<number>(ENV_PASSWORD_SALT);
    const hashPassword = await hash(password, Number(salt));
    let imageFile = null;

    if (userEmail !== null && email === userEmail.email) {
      throw new BadRequestException('이미 존재하는 이메일 입니다.');
    }

    if (
      !email.includes('@naver.com') &&
      !email.includes('@daum.net') &&
      !email.includes('@google.com') &&
      !email.includes('@gmail.com') &&
      !email.includes('@googlemail.com') &&
      !email.includes('@hanmail.net') &&
      !email.includes('@icloud.com') &&
      !email.includes('@cyworld.com') &&
      !email.includes('@kakao.com') &&
      !email.includes('@mail.com') &&
      !email.includes('@narasarang.or.kr') &&
      !email.includes('@tistory.com')
    ) {
      throw new BadRequestException('이메일 형식이 알맞지 않습니다.');
    }

    if (password !== passwordConfirm) {
      throw new BadRequestException('패스워드 확인란을 다시 입력해주세요.');
    }

    if (userName !== null && nickname === userName.nickname) {
      throw new BadRequestException('이미 존재하는 닉네임입니다.');
    }

    if (phoneNumber && !phoneNumberRegex.test(phoneNumber)) {
      throw new BadRequestException('정상적인 핸드폰 번호를 입력해주세요.');
    }

    if (userPhone !== null && phoneNumber === userPhone.phoneNumber) {
      throw new BadRequestException('이미 등록된 핸드폰 번호입니다.');
    }

    if (file) {
      imageFile = await this.imageService.imageUploadS3(file);
    }

    const changeBoolean = Boolean(isOpen);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userSave = this.userRepository.create({
        email,
        password: hashPassword,
        nickname,
        isOpen: changeBoolean,
      });

      await this.userRepository.save(userSave);

      const userInfoSave = this.userInfosRepository.create({
        id: userSave.id,
        image: imageFile,
        address,
        phoneNumber,
      });

      await this.userInfosRepository.save(userInfoSave);

      const userRoleSave = this.rolesRepository.create({
        userId: userSave.id,
      });

      await this.rolesRepository.save(userRoleSave);

      await queryRunner.commitTransaction();

      return {
        statusCode: 201,
        message: '성공적으로 회원가입이 완료되었습니다.',
      };
    } catch (err) {
      console.error(err);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('데이터 생성에 실패하였습니다.');
    } finally {
      await queryRunner.release();
    }
  }

  // 회원 로그인
  async login(loginDto: LoginDto, userIp: string, userAgent: string) {
    const { email, password } = loginDto;
    const users = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password'],
    });

    if (!users) {
      throw new NotFoundException('유저가 존재하지 않습니다.');
    }

    if (!(await compare(password, users.password))) {
      throw new BadRequestException('패스워드가 일치하지 않습니다.');
    }

    const payload = { email, sub: users.id };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>(ENV_REFRESH_SECRET_KEY),
      expiresIn: '7d',
    });

    const setSession = {
      userId: users.id,
      userIp,
      userAgent,
      refreshToken: `Bearer ${refreshToken}`,
      deadline: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };

    await this.cacheManager.set(
      `userAgent:${users.id}:${userIp}:${userAgent}`,
      setSession,
      60 * 60 * 24 * 7,
    );

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  // 리프레쉬 토큰 재발급
  async refreshTokenRetry(
    refreshToken: string,
    userId: number,
    userIp: string,
    userAgent: string,
  ) {
    const [cookieTokenType, cookieRefreshToken] = refreshToken.split(' ');
    if (!cookieRefreshToken) {
      throw new NotFoundException('리프레쉬 토큰이 존재하지 않습니다.');
    }

    if (cookieTokenType !== 'Bearer') {
      throw new UnauthorizedException('토큰 타입이 올바르지 않습니다.');
    }

    const getUserAgent = await this.cacheManager.get(
      `userAgent:${userId}:${userIp}:${userAgent}`,
    );
    const [sessionRefreshTokenType, sessionRefreshToken] =
      getUserAgent['refreshToken'].split(' ');

    if (!sessionRefreshToken) {
      throw new UnauthorizedException('세션 정보가 존재하지 않습니다.');
    }

    if (sessionRefreshTokenType !== 'Bearer') {
      throw new UnauthorizedException('토큰 타입이 올바르지 않습니다.');
    }

    try {
      const decode = await this.jwtService.verify(cookieRefreshToken, {
        secret: this.configService.getOrThrow<string>(ENV_REFRESH_SECRET_KEY),
      });
      const sessionDecode = await this.jwtService.verify(sessionRefreshToken, {
        secret: this.configService.getOrThrow<string>(ENV_REFRESH_SECRET_KEY),
      });

      if (
        decode.email !== sessionDecode.email ||
        decode.sub !== sessionDecode.sub
      ) {
        throw new UnauthorizedException(
          '토큰이 변형되었습니다. 재 로그인이 필요합니다.',
        );
      }

      if (
        Date.now() > getUserAgent['deadline'] ||
        Date.now() > decode.exp * 1000
      ) {
        throw new UnauthorizedException(
          '토큰이 만료되었습니다. 재 로그인이 필요합니다.',
        );
      }

      const findUser = await this.userRepository.findOne({
        where: { id: decode.id },
        select: ['id', 'email'],
      });

      if (!findUser) {
        throw new NotFoundException('유저가 존재하지 않습니다.');
      }

      const payload = { email: findUser.email, sub: findUser.id };

      const accessToken = this.jwtService.sign(payload);
      const newRefreshToken = this.jwtService.sign(payload, {
        secret: this.configService.getOrThrow<string>(ENV_REFRESH_SECRET_KEY),
        expiresIn: '7d',
      });

      const setSession = {
        userId: findUser.id,
        userIp,
        userAgent,
        refreshToken: newRefreshToken,
        deadline: Date.now() + 7 * 24 * 60 * 60 * 1000,
      };

      await this.cacheManager.set(
        `userAgent:${userId}:${userIp}:${userAgent}`,
        setSession,
        60 * 60 * 24 * 7,
      );

      return { accessToken: accessToken, refreshToken: newRefreshToken };
    } catch (err) {
      console.error(err);
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException(
          '리프레시 토큰이 만료되었습니다. 재로그인이 필요합니다.',
        );
      } else if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException(
          '리프레시 토큰이 변형되었습니다. 재로그인이 필요합니다.',
        );
      } else {
        throw new UnauthorizedException(
          '리프레시 토큰 검증에 실패했습니다. 재로그인이 필요합니다.',
        );
      }
    }
  }

  // 로그아웃
  async logout(userId: number, userIp: string, userAgent: string) {
    const getUserAgent = await this.cacheManager.get(
      `userAgent:${userId}:${userIp}:${userAgent}`,
    );

    if (!getUserAgent) {
      throw new UnauthorizedException('세션 정보가 존재하지 않습니다.');
    } else {
      await this.cacheManager.del(`userAgent:${userId}:${userIp}:${userAgent}`);
    }

    return;
  }

  // 이메일로 유저 존재 여부 확인
  async findEmail(email: string) {
    const users = await this.userRepository.findOne({
      where: { email },
      relations: { userInfos: true, roles: true },
      select: {
        id: true,
        email: true,
        password: true,
        nickname: true,
        isOpen: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        userInfos: {
          id: true,
          address: true,
          image: true,
          phoneNumber: true,
        },
        roles: {
          id: true,
          userId: true,
          roleName: true,
        },
      },
    });

    if (!users) {
      throw new NotFoundException('유저가 존재하지 않습니다.');
    }

    return users;
  }
}
