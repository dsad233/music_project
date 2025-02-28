import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from 'src/users/entities/users.entity';
import { UserInfos } from 'src/users/entities/userInfos.entity';
import { Roles } from 'src/users/entities/roles.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ImageService } from 'src/image/image.service';
import bcrypt from "bcrypt";

const mockUsersRepository = {
  create : jest.fn(),
  save : jest.fn(),
  findOne : jest.fn(),
};

const mockUserInfosRepository = {
  findOne : jest.fn(),
  create : jest.fn(),
  save : jest.fn(),
};

const mockRolesRepository = {
  create : jest.fn(),
  save : jest.fn(),
};

const mockFile: Express.Multer.File = {
  fieldname: 'image',
  originalname: 'test-image.png',
  encoding: '7bit',
  mimetype: 'image/png',
  buffer: Buffer.from(''),
  size: 1000,
  destination: '',
  filename: '',
  path: '',
  stream: undefined,
};

const mockConfigService = {
  getOrThrow : jest.fn()
};

const mockImageService = {
  imageUploadS3 : jest.fn()
};

const qr = {
  manager : {}
} as QueryRunner;

class ConnectionMock {
  createQueryRunner(mode? : 'master' | 'slave') : QueryRunner {
    return qr;
  }
};

describe('AuthService', () => {
  let authService: AuthService;
  let configService : ConfigService;
  let jwtService : JwtService;
  let imageService : ImageService;
  let dataSource : DataSource;
  let usersRepository: Repository<Users>;
  let userInfosRepository: Repository<UserInfos>;
  let rolesRepository: Repository<Roles>;

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    Object.assign(qr.manager, {
      create : jest.fn(),
      save : jest.fn()
    });
    qr.connect = jest.fn();
    qr.release = jest.fn();
    qr.startTransaction = jest.fn();
    qr.commitTransaction = jest.fn();
    qr.rollbackTransaction = jest.fn();

    dataSource = new ConnectionMock() as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService,
        {
          provide : getRepositoryToken(Users),
          useValue : mockUsersRepository
        },
        {
          provide : getRepositoryToken(UserInfos),
          useValue : mockUserInfosRepository
        },
        {
          provide : getRepositoryToken(Roles),
          useValue : mockRolesRepository
        },
        {
          provide : ConfigService,
          useValue : mockConfigService
        },
        {
          provide : ImageService,
          useValue : mockImageService
        },
        {
          provide : JwtService,
          useFactory : () => {
            return new JwtService({
              secret : "JWT_SECRET_KEY",
              signOptions : {
                expiresIn : '1h'
              }
            })
          },
          inject : [ConfigService]
        },
        {
          provide : DataSource,
          useValue : dataSource
        }
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);

    usersRepository = module.get<Repository<Users>>(getRepositoryToken(Users));
    userInfosRepository = module.get<Repository<UserInfos>>(getRepositoryToken(UserInfos));
    rolesRepository = module.get<Repository<Roles>>(getRepositoryToken(Roles));
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);
    imageService = module.get<ImageService>(ImageService);
  });

  it('Auth Register', async () => {
    const mockSalt = 10;
    const imageS3 = {
      image : "image.png"
    };

    const registerDto = {
      id : 1,
      email : "test@naver.com",
      password : "1234",
      passwordConfirm : "1234",
      nickname : "nick_test",
      address : "address",
      phoneNumber : "010-0000-0000",
      isOpen : true
    };

    mockUsersRepository.findOne.mockImplementation(({ where }) => {
      if(where.email) return Promise.resolve({ email : "testnew@naver.com" });
      if(where.nickname) return Promise.resolve({ nickname : "test_new_nickname" });
      return Promise.resolve(null);
    });
    mockUserInfosRepository.findOne.mockResolvedValue(registerDto.phoneNumber);
    mockConfigService.getOrThrow.mockReturnValue(mockSalt);

    jest.spyOn(bcrypt, 'hash').mockResolvedValue("hashPassword");
    const imageImput = await imageService.imageUploadS3(mockFile);
    let image = !imageS3.image ? null : imageImput;
    
    mockUsersRepository.create.mockReturnValue({
      email : registerDto.email,
      password : "hashPassword",
      nickname : registerDto.nickname,
      isOpen : registerDto.isOpen
    });
    mockUsersRepository.save.mockResolvedValue({
      email : registerDto.email,
      password : "hashPassword",
      nickname : registerDto.nickname,
      isOpen : registerDto.isOpen
    });

    mockUserInfosRepository.create.mockReturnValue({
      id : registerDto.id,
      image,
      address : registerDto.address,
      phoneNumber : registerDto.phoneNumber
    });
    mockUserInfosRepository.save.mockResolvedValue({
      id : registerDto.id,
      image,
      address : registerDto.address,
      phoneNumber : registerDto.phoneNumber
    });

    mockRolesRepository.create.mockReturnValue({
      userId : registerDto.id
    });
    mockRolesRepository.save.mockResolvedValue({
      userId : registerDto.id
    });

    const result = await authService.create(registerDto, mockFile);

    expect(mockUsersRepository.findOne).toHaveBeenCalledTimes(2);
    expect(mockUsersRepository.findOne).toHaveBeenCalledWith(
      { select : ['email'], where : { email : registerDto.email }, withDeleted : true }
    );
    expect(mockUsersRepository.findOne).toHaveBeenCalledWith(
      { select : ['nickname'], where : { nickname : registerDto.nickname }, withDeleted : true }
    );

    expect(mockUserInfosRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockUserInfosRepository.findOne).toHaveBeenCalledWith(
      { select : ['phoneNumber'], where : { phoneNumber : registerDto.phoneNumber }, withDeleted : true }
    );

    expect(mockConfigService.getOrThrow).toHaveBeenCalledTimes(1);
    expect(mockConfigService.getOrThrow).toHaveBeenCalledWith("PASSWORD_SALT");

    expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, Number(mockSalt));

    expect(mockUsersRepository.create).toHaveBeenCalledTimes(1);
    expect(mockUsersRepository.save).toHaveBeenCalledTimes(1);

    expect(mockUserInfosRepository.create).toHaveBeenCalledTimes(1);
    expect(mockUserInfosRepository.save).toHaveBeenCalledTimes(1);

    expect(mockRolesRepository.create).toHaveBeenCalledTimes(1);
    expect(mockRolesRepository.save).toHaveBeenCalledTimes(1);

    expect(qr.connect).toHaveBeenCalledTimes(1);
    expect(qr.startTransaction).toHaveBeenCalledTimes(1);
    expect(qr.commitTransaction).toHaveBeenCalledTimes(1);
    expect(qr.rollbackTransaction).not.toHaveBeenCalled();
    expect(result).toEqual({ statusCode : 201, message : "성공적으로 회원가입이 완료되었습니다." });
    expect(qr.release).toHaveBeenCalledTimes(1);
  });

  it('Auth Login', async () => {
    const loginDto = {
      email : "test@naver.com",
      password : "1234"
    };

    const users = {
      id : 1,
      email : "test@naver.com",
      password : "hashPassword"
    };

    const accessToken = "ACCESS_TOKEN";
    const refreshToken = "REFRESH_TOKEN";
    
    const refreshTokenSecretKey = "REFRESH_SECRET_KEY";

    mockUsersRepository.findOne.mockResolvedValue(users);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(loginDto.password, users.password);

    mockConfigService.getOrThrow.mockImplementation((key : string) => {
      if(key === "REFRESH_SECRET_KEY"){
        return refreshTokenSecretKey;
      }

      return null;
    });

    jest.spyOn(jwtService, 'sign').mockImplementation((payload, options) => {
      if(options){
        return refreshToken;
      } else {
        return accessToken;
      }
    });

    const result = await authService.login(loginDto);

    expect(mockUsersRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockUsersRepository.findOne).toHaveBeenCalledWith({ select : ['id', 'email', 'password'], where : { email : loginDto.email } });

    expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    expect(jwtService.sign).toHaveBeenCalledTimes(2);
    expect(jwtService.sign).toHaveBeenCalledWith(
      { email : loginDto.email, sub : users.id }
    );
    expect(jwtService.sign).toHaveBeenCalledWith(
      { email : loginDto.email, sub : users.id }, { expiresIn : "1h", secret : refreshTokenSecretKey }
    );
    expect(result).toEqual({
      accessToken : accessToken,
      refreshToken : refreshToken
    });
  });

  it('Auth RefreshToken', async () => {
    const users = {
      id : 1,
      email : "test@naver.com",
      password : "1234",
      isOpen : true
    };

    const accessToken = "ACCESS_TOKEN";
    const refreshToken = "REFRESH_TOKEN";

    const accessTokenSecretKey = "ACCESS_SECRET_KEY";
    const refreshTokenSecretKey = "REFRESH_SECRET_KEY";

    jest.spyOn(configService, 'getOrThrow').mockImplementation((key : string) => {
      if(key === "REFRESH_SECRET_KEY"){
        return refreshTokenSecretKey;
      } else if(key === "JWT_SECRET_KEY"){
        return accessTokenSecretKey;
      }

      return null;
    });
    jest.spyOn(jwtService, 'verify').mockReturnValue({ id : users.id });
    mockUsersRepository.findOne.mockResolvedValue({ id : users.id, email : users.email });

    jest.spyOn(jwtService, 'sign').mockImplementation((payload, options?) => {
      if(options){
        return refreshToken;
      } else {
        return accessToken;
      }
    });

    const result = await authService.refreshTokenRetry(refreshToken);

    expect(mockUsersRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockUsersRepository.findOne).toHaveBeenCalledWith({ select : ['id', 'email'], where : { id : users.id } });
  
    expect(jwtService.verify).toHaveBeenCalledTimes(1);
    expect(jwtService.verify).toHaveBeenCalledWith(refreshToken, { secret : refreshTokenSecretKey });

    expect(jwtService.sign).toHaveBeenCalledTimes(2);
    expect(jwtService.sign).toHaveBeenCalledWith(
      { email : users.email, sub : users.id }
    );
    expect(jwtService.sign).toHaveBeenCalledWith(
      { email : users.email, sub : users.id }, { expiresIn : "1h", secret : refreshTokenSecretKey }
    );
    expect(result).toEqual({ 
      accessToken : accessToken, 
      refreshToken : refreshToken
     });
  });

  it('Auth findEmail', async () => {
    const users = {
      id : 1,
      email : "test@naver.com",
      password : "1234",
      nickname : true,
      isOpen : true,
      createdAt : true,
      updatedAt : true,
      deletedAt : true,
      userInfos : {
        address : true,
        image : true,
        phoneNumber : true
      }
    };

    mockUsersRepository.findOne.mockResolvedValue(users);
    
    const result = await authService.findEmail(users.email);

    expect(result).toEqual(users);
  });
});
