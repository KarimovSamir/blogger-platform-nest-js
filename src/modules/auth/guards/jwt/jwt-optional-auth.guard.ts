import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtOptionalAuthGuard extends AuthGuard('jwt') {
    handleRequest(err: any, user: any) {
        return user || null; // не кидаем ошибку если нет токена
    }
}
