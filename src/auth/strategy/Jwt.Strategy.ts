import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ENV_JWT_SECRET_KEY } from "src/const/keys";
import { AuthService } from "../auth.service";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(private readonly configService : ConfigService,
       private readonly authService : AuthService
    ){
        super({
            jwtFromRequest : ExtractJwt.fromExtractors([
                (request: any) => {
                  let token = null;
                 
                  if(request.cookies){
                    token = request.cookies['accessToken'];
                  }

                  if(!token){
                    throw new NotFoundException("사용자 정보가 존재하지 않습니다.");
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
            throw new NotFoundException("정보가 존재하지 않습니다.");
        }

        return users;
    }
}