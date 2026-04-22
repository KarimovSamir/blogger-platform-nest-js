import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';

// Когда guard распакует токен, он передаст этот объект в validate() ниже.
export interface RefreshTokenPayload {
    userId: string;
    deviceId: string;
    iat: number;  // issued at, в секундах (Unix timestamp)
    exp: number;  // expires, в секундах
}

// Форма, которая в итоге окажется в req.user после успешной валидации.
// Это то, что контроллер потом читает.
export interface RefreshTokenUser {
    userId: string;
    deviceId: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(
        private readonly securityDevicesRepository: SecurityDevicesRepository,
        // Используем ConfigService вместо SETTINGS — он читает .env уже после загрузки ConfigModule.
        // SETTINGS читается в момент импорта файла, то есть до старта приложения — тогда process.env ещё пустой.
        configService: ConfigService,
    ) {
        // вызов конструктора родительского класса (PassportStrategy) 
        // при создании объекта класса JwtRefreshStrategy сначала вызывается super до конструктора
        super({
            // Откуда доставать токен. Для refresh — из куки, не из заголовка.
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => {
                    return req?.cookies?.refreshToken || null;
                },
            ]),
            // ?? '' — гарантирует что тип будет string, а не string | undefined.
            // TypeScript требует именно string, undefined не принимает.
            secretOrKey: configService.get<string>('RT_SECRET') ?? '',
            // Если false — просроченный токен Passport сам отвергнет с 401.
            ignoreExpiration: false,
        });
    }

    // validate() вызывается Passport'ом ПОСЛЕ того, как он:
    //   1) достал токен из куки
    //   2) проверил подпись секретом RC_SECRET
    //   3) проверил, что токен не просрочен (exp > now)
    // Если любой шаг провалился — validate() не вызывается, возвращается 401.
    async validate(payload: RefreshTokenPayload): Promise<RefreshTokenUser> {
        // Ищем сессию по deviceId
        const device = await this.securityDevicesRepository.findByDeviceId(
            payload.deviceId,
        );
        if (!device) {
            throw new UnauthorizedException();
        }
        // Проверяем актуальность токена через сравнение iat и lastActiveDate.
        //    iat в JWT — в секундах (Unix timestamp).
        //    lastActiveDate у нас — ISO-строка (так требует документация и swagger).
        //    Чтобы сравнить, приводим оба к одному виду.
        //
        //    Берём ISO-строку → Date → миллисекунды → секунды:
        const sessionIatInSeconds = Math.floor(
            new Date(device.lastActiveDate).getTime() / 1000,
        );
        if (sessionIatInSeconds !== payload.iat) {
            // Токен подписан правильно и не просрочен, но он УЖЕ БЫЛ ИСПОЛЬЗОВАН
            throw new UnauthorizedException();
        }
        // Всё сошлось. Возвращаем объект — он станет req.user.
        // Возвращаем только то, что реально нужно контроллеру и use-case'ам.
        // Полный payload с iat/exp наружу не светим.
        return {
            userId: payload.userId,
            deviceId: payload.deviceId,
        };
    }
}