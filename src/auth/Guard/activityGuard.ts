import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";

export class ActivityGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        console.log("Guard request Test : ",request);
        return request;
    }
}