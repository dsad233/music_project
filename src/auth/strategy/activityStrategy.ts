import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "src/users/users.service";

export class activityStrategy extends PassportStrategy(Strategy, 'jwt'){
    constructor(private readonly configService : ConfigService,
        private readonly usersServices : UsersService){
        super({
            jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretKey : configService.get<string>('dd')
        });
    }

    
}