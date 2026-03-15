import * as jwt from "jsonwebtoken";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AccessPayload, RefreshPayload } from "../domain/jwt-payloads";

@Injectable()
export class JwtService {
    constructor(private configService: ConfigService) {}

    async createAccessToken(userId: string): Promise<string> {
        const payload: AccessPayload = { userId };
        // Берем строго из настроек. Нет ключа - будет ошибка.
        const secret = this.configService.getOrThrow<string>('AC_SECRET');
        const time = Number(this.configService.getOrThrow<number>('AC_TIME'));

        return jwt.sign(payload, secret, { expiresIn: time });
    }

    async createRefreshToken(
        userId: string,
        deviceId: string,
    ): Promise<string> {
        const payload: RefreshPayload = { userId, deviceId };
        const secret = this.configService.getOrThrow<string>('RT_SECRET');
        const time = Number(this.configService.getOrThrow<number>('RT_TIME'));

        return jwt.sign(payload, secret, { expiresIn: time });
    }

    async decodeToken(token: string): Promise<unknown> {
        try {
            return jwt.decode(token);
        } catch {
            return null;
        }
    }

    async verifyAccessToken(token: string): Promise<AccessPayload | null> {
        try {
            const secret = this.configService.getOrThrow<string>('AC_SECRET');
            return jwt.verify(token, secret) as unknown as AccessPayload;
        } catch {
            return null;
        }
    }

    async verifyRefreshToken(token: string): Promise<RefreshPayload | null> {
        try {
            const secret = this.configService.getOrThrow<string>('RT_SECRET');
            return jwt.verify(token, secret) as unknown as RefreshPayload;
        } catch {
            return null;
        }
    }
}