import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { ENV_REFRESH_SECRET_KEY } from 'src/utils/const/keys';

@Injectable()
export class TokenVerifyService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // 리프래쉬 토큰 검증
  async verifyRefreshToken(
    refreshToken: string,
    userIp: string,
    userAgent: string,
    userId: number,
  ) {
    const [cookieTokenType, cookieRefreshToken] = refreshToken.split(' ');

    if (!cookieRefreshToken) {
      throw new NotFoundException('리프레쉬 토큰이 존재하지 않습니다.');
    }

    if (cookieTokenType.toLowerCase() !== 'bearer') {
      throw new UnauthorizedException('토큰 타입이 올바르지 않습니다.');
    }

    const cookieRefreshTokenSplit = cookieRefreshToken.split('.');

    if (cookieRefreshTokenSplit && cookieRefreshTokenSplit.length !== 3) {
      throw new BadRequestException(
        '올바르지 않는 토큰 형식입니다. 재로그인 해주세요.',
      );
    }

    const getUserAgent = await this.cacheManager.get(
      `userAgent:${userId}:${userIp}:${userAgent}`,
    );

    if (!getUserAgent) {
      throw new UnauthorizedException(
        '세션 정보가 존재하지 않습니다. 재로그인 해주세요.',
      );
    }

    const [sessionRefreshTokenType, sessionRefreshToken] =
      getUserAgent['refreshToken'].split(' ');

    if (!sessionRefreshToken) {
      throw new NotFoundException('세션 토큰이 존재하지 않습니다.');
    }

    if (sessionRefreshTokenType.toLowerCase() !== 'bearer') {
      throw new UnauthorizedException('토큰 타입이 올바르지 않습니다.');
    }

    const sessionRefreshTokenSplit = sessionRefreshToken.split('.');

    if (sessionRefreshTokenSplit && sessionRefreshTokenSplit.length !== 3) {
      throw new BadRequestException(
        '올바르지 않는 토큰 형식입니다. 재로그인 해주세요.',
      );
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
        Date.now() > decode.exp * 1000 ||
        Date.now() > getUserAgent['deadline']
      ) {
        throw new UnauthorizedException(
          '토큰이 만료되었습니다. 재 로그인이 필요합니다.',
        );
      }
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

    return true;
  }
}
