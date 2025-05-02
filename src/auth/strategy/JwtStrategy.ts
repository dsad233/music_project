import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ENV_JWT_SECRET_KEY } from "src/const/keys";
import { AuthService } from "../auth.service";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt'){
    constructor(private readonly configService : ConfigService,
       private readonly authService : AuthService
    ){
        super({
            jwtFromRequest : ExtractJwt.fromExtractors([
                (request: any) => {
                  let token = null;
                  let tokenType = null;
                 
                  if(request.cookies && request.cookies['accessToken']){
                    [tokenType, token] = request.cookies['accessToken'].split(' ');

                    if(tokenType.toLowerCase() !== 'bearer'){
                      throw new UnauthorizedException("토큰 타입이 올바르지 않습니다.");
                    }
  
                    if(!token){
                      throw new NotFoundException("사용자 정보가 존재하지 않습니다.");
                    }
                  } else {
                    throw new NotFoundException("액세스 할 수 있는 토큰이 존재하지 않습니다. 로그인을 시도해주세요.");
                  }

                  return token;
                },
              ]),
            ignoreExpiration: false,
            secretOrKey : configService.getOrThrow<string>(ENV_JWT_SECRET_KEY)
        });        
    }

    async validate(payload : any){
        const users = await this.authService.findEmail(payload.email);

        if(!users){
            throw new NotFoundException("유저 정보가 존재하지 않습니다.");
        }

        return users;
    }
}