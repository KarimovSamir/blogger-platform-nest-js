import { Injectable } from "@nestjs/common";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

function createHash(password: string, salt: string): Buffer {
    return scryptSync(password, salt, 64);
}

@Injectable()
export class BcryptService {
    async generateHash(password: string): Promise<string> {
        const salt = randomBytes(16).toString("hex");
        const derivedKey = createHash(password, salt);

        return `${salt}:${derivedKey.toString("hex")}`;
    }

    async checkPassword(password: string, hash: string): Promise<boolean> {
        const [salt, storedHash] = hash.split(":");

        if (!salt || !storedHash) {
            return false;
        }

        const derivedKey = createHash(password, salt);
        const storedHashBuffer = Buffer.from(storedHash, "hex");

        if (storedHashBuffer.length !== derivedKey.length) {
            return false;
        }

        return timingSafeEqual(storedHashBuffer, derivedKey);
    }
}
