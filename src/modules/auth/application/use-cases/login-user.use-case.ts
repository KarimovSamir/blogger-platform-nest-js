import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';
import { Device } from '../../../security-devices/domain/device.entity';
import { JwtTokensService } from '../../../../core/adapters/jwt-tokens.service';

// Команда теперь несёт ещё и метаданные запроса — ip и userAgent, 
// чтобы записать сессию устройства в БД.
export class LoginUserCommand {
    constructor(
        public userId: string,
        public login: string,
        public ip: string,
        public userAgent: string,
    ) {}
}

export interface LoginResult {
    accessToken: string;
    refreshToken: string;
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand, LoginResult> {
    constructor(
        private readonly jwtTokensService: JwtTokensService,
        private readonly securityDevicesRepository: SecurityDevicesRepository,
    ) {}

    async execute(command: LoginUserCommand): Promise<LoginResult> {
        const { userId, login, ip, userAgent } = command;
        // каждый логин = новая сессия
        const deviceId = uuidv4();
        // Выпускаем refresh-токен. decoded.iat нужен, чтобы
        // lastActiveDate в БД совпал с iat токена — это основа
        // всей проверки "токен актуален / устарел" в JwtRefreshStrategy.
        const { token: refreshToken, decoded } =
            this.jwtTokensService.createRefreshToken({ userId, deviceId });

        // Создаём запись сессии.
        // lastActiveDate — ISO-строка, полученная из iat.
        // expireAt — Date из exp, на будущее (можно повесить TTL-индекс
        // для автоочистки просроченных сессий).
        // Теперь вызываем статический метод напрямую через класс,
        // а не через Mongoose-модель — plain-объект не нуждается в save().
        const device = Device.createInstance({
            userId,
            deviceId,
            ip,
            title: userAgent,
            lastActiveDate: new Date(decoded.iat * 1000).toISOString(),
            expireAt: new Date(decoded.exp * 1000),
        });
        await this.securityDevicesRepository.save(device);

        // Access-токен отдельно. Он stateless, в БД про него ничего не пишем.
        const accessToken = this.jwtTokensService.createAccessToken({ userId, login });
        return { accessToken, refreshToken };
    }
}
