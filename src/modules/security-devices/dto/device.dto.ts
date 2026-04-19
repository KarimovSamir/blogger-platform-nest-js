// DTO для создания сессии. Передаётся в фабричный метод.
export class CreateDeviceDomainDto {
    userId: string;
    deviceId: string;
    ip: string;
    title: string;
    lastActiveDate: string; // ISO-строка, производная от iat refresh-токена
    expireAt: Date;
}