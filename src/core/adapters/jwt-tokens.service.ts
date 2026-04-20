import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SETTINGS } from '../settings/settings';

export interface AccessTokenPayload {
    userId: string;
    login: string;
}

export interface RefreshTokenPayloadInput {
    userId: string;
    deviceId: string;
}

// Декодированный refresh-токен: к payload'у добавляются iat и exp
// которые jwt.sign вписывает сам.
export interface DecodedRefreshToken {
    userId: string;
    deviceId: string;
    iat: number;
    exp: number;
}

@Injectable()
export class JwtTokensService {
    constructor(private readonly jwtService: JwtService) {}

    // Выпускаем access-токен. Просто подписываем payload.
    createAccessToken(payload: AccessTokenPayload): string {
        return this.jwtService.sign(payload, {
            secret: SETTINGS.AC_SECRET,
            expiresIn: SETTINGS.AC_TIME,
        });
    }

    // создаём refresh-токен и сразу возвращаем его в декодированном виде.
    createRefreshToken(payload: RefreshTokenPayloadInput): {
        token: string;
        decoded: DecodedRefreshToken;
    } {
        const token = this.jwtService.sign(payload, {
            secret: SETTINGS.RT_SECRET,
            expiresIn: SETTINGS.RT_TIME,
        });

        // decode() не проверяет подпись — просто парсит payload.
        // Нам проверять нечего: мы сами подписали секунду назад.
        const decoded = this.jwtService.decode(token) as DecodedRefreshToken;

        return { token, decoded };
    }
}