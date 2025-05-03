import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Posts } from './entities/posts.entity';
import { ImageService } from 'src/image/image.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Like, Repository } from 'typeorm';

const mockPostsRepository = {
  get: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    // getManyAndCount: jest.fn().mockReturnValueOnce(<expected response>),
    select: jest.fn(),
    innerJoin: jest.fn(),
    andWhere: jest.fn(),
  })),
};

const mockImageService = {
  imageUploadS3: jest.fn(),
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

describe('PostsService', () => {
  let postsRepository: Repository<Posts>;
  let postsService: PostsService;
  let imageService: ImageService;

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Posts),
          useValue: mockPostsRepository,
        },
        {
          provide: ImageService,
          useValue: mockImageService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {},
        },
      ],
    }).compile();

    postsRepository = module.get<Repository<Posts>>(getRepositoryToken(Posts));
    postsService = module.get<PostsService>(PostsService);
    imageService = module.get<ImageService>(ImageService);
  });

  it('Posts Create Method', async () => {
    jest.mock('./enum/genres', () => ({
      postEnum: jest.requireActual('./enum/genres').Genres,
    }));

    const { postEnum } = require('./enum/genres');

    const createPostDto = {
      title: 'title',
      singerName: 'sigerName',
      genre: postEnum.Pop,
      lyrics: 'default_lyrics',
      releaseDate: new Date(),
      isOpen: true,
    };

    const imageS3 = {
      image: 'postImage.png',
    };

    const userId = 1;

    mockPostsRepository.findOne.mockResolvedValue('test_title');
    mockPostsRepository.findOne.mockResolvedValue('test_singerName');
    mockPostsRepository.findOne.mockResolvedValue('test_pop');
    const imageImput = await imageService.imageUploadS3(mockFile);
    let postImage = !imageS3.image ? null : imageImput;

    mockPostsRepository.create.mockReturnValue({
      userId,
      ...createPostDto,
      postImg: postImage,
    });
    mockPostsRepository.save.mockResolvedValue({
      userId,
      ...createPostDto,
      postImg: postImage,
    });

    const result = await postsService.create(createPostDto, mockFile, userId);

    expect(mockPostsRepository.findOne).toHaveBeenCalledTimes(3);
    expect(mockPostsRepository.findOne).toHaveBeenCalledWith({
      select: ['title'],
      where: { title: createPostDto.title },
      withDeleted: true,
    });
    expect(mockPostsRepository.findOne).toHaveBeenCalledWith({
      select: ['singerName'],
      where: { singerName: createPostDto.singerName },
      withDeleted: true,
    });
    expect(mockPostsRepository.findOne).toHaveBeenCalledWith({
      select: ['genre'],
      where: { genre: createPostDto.genre },
      withDeleted: true,
    });

    expect(mockPostsRepository.create).toHaveBeenCalledTimes(1);
    expect(mockPostsRepository.create).toHaveBeenCalledWith({
      userId,
      ...createPostDto,
      postImg: postImage,
    });

    expect(mockPostsRepository.save).toHaveBeenCalledTimes(1);
    expect(mockPostsRepository.save).toHaveBeenCalledWith({
      userId,
      ...createPostDto,
      postImg: postImage,
    });

    expect(result).toEqual({
      statusCode: 201,
      message: '노래 목록이 성공적으로 작성되었습니다.',
      data: {
        userId,
        ...createPostDto,
        postImg: postImage,
      },
    });
  });

  it('Posts findAll Method', async () => {
    const page = 1;
    const pageSize = 10;
    const searchTitle = 'name';
    const searchSingerName = 'name';
    const postData = [
      {
        id: 1,
        title: 'title',
        singerName: 'name',
        postImg: 'postImage.png',
      },
      {
        id: 2,
        title: 'title2',
        singerName: 'name2',
        postImg: 'postImage.png',
      },
    ];

    const totalData = 2;

    let where: Record<string, any> = { isOpen: true };

    if (searchTitle) {
      where.title = Like(`%${searchTitle}%`);
    }

    if (searchSingerName) {
      where.singerName = Like(`%${searchSingerName}%`);
    }

    mockPostsRepository.find.mockResolvedValue(postData);
    mockPostsRepository.count.mockResolvedValue(totalData);

    const result = await postsService.findAll(
      page,
      pageSize,
      searchTitle,
      searchSingerName,
    );

    expect(mockPostsRepository.find).toHaveBeenCalledTimes(1);
    expect(mockPostsRepository.find).toHaveBeenCalledWith({
      where,
      select: ['id', 'title', 'singerName', 'postImg'],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    expect(mockPostsRepository.count).toHaveBeenCalledTimes(1);
    expect(mockPostsRepository.count).toHaveBeenCalledWith({
      where,
    });

    const pageRange = Math.ceil(totalData / pageSize);

    expect(result).toEqual({
      statusCode: 200,
      message: '성공적으로 노래 전체 조회가 완료되었습니다.',
      total: totalData,
      pageRange: pageRange,
      data: postData,
    });
  });
});
