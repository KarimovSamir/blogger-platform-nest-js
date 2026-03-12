import * as jwt from "jsonwebtoken";
import { Injectable } from "@nestjs/common";
import { SETTINGS } from "../settings/settings";
import { AccessPayload, RefreshPayload } from "../domain/jwt-payloads";

@Injectable()
export class JwtService {
    async createAccessToken(userId: string): Promise<string> {
        const payload: AccessPayload = { userId };
        return jwt.sign(payload, SETTINGS.AC_SECRET, {
            expiresIn: SETTINGS.AC_TIME,
        });
    }

    async createRefreshToken(
        userId: string,
        deviceId: string,
    ): Promise<string> {
        const payload: RefreshPayload = { userId, deviceId };
        return jwt.sign(payload, SETTINGS.RT_SECRET, {
            expiresIn: SETTINGS.RT_TIME,
        });
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
            return jwt.verify(token, SETTINGS.AC_SECRET) as AccessPayload;
        } catch {
            return null;
        }
    }

    async verifyRefreshToken(token: string): Promise<RefreshPayload | null> {
        try {
            return jwt.verify(token, SETTINGS.RT_SECRET) as RefreshPayload;
        } catch {
            return null;
        }
    }
}
