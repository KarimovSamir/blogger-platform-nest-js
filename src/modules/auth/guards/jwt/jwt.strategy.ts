import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private configService: ConfigService) {
        super({
            // Указываем, откуда брать токен (из заголовка Authorization как Bearer токен)
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            // Если токен протух, стратегия сама выкинет 401 ошибку
            ignoreExpiration: false,
            // Тот самый ключ, которым мы шифровали токен
            secretOrKey: configService.getOrThrow<string>('AC_SECRET'),
        });
    }

    // Этот метод вызовется ТОЛЬКО если токен валидный и не протух.
    // В аргумент payload упадет то, что мы зашифровали в JwtService ({ userId: string })
    async validate(payload: any) {
        // То, что мы возвращаем здесь, NestJS положит в req.user
        return { userId: payload.userId };
    }
}