import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesEnum } from "src/users/enums/roles.enum";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector : Reflector){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const getRoles = this.reflector.get<string[]>("roles", context.getHandler());

        if(!getRoles){
            return true;
        }
        
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if(!user){
            throw new NotFoundException("유저 정보가 존재하지 않습니다.");
        }

        if(user && user.roles[0].roleName !== RolesEnum.admin){
            throw new ForbiddenException("접근 권한이 없습니다.");
        }

        const hasRole = getRoles.some((data) => user.roles[0].roleName.includes(data));
        return hasRole;
    }
}