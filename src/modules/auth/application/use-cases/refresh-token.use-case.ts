import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';
import { JwtTokensService } from '../../../../core/adapters/jwt-tokens.service';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

// Команду вызывает контроллер ПОСЛЕ того, как JwtRefreshAuthGuard
// уже валидировал refresh-токен. То есть userId и deviceId мы
// получаем из проверенного payload
export class RefreshTokenCommand {
    constructor(
        public readonly userId: string,
        public readonly deviceId: string,
        public readonly ip: string,
        public readonly userAgent: string,
    ) {}
}

export interface RefreshResult {
    accessToken: string;
    refreshToken: string;
}


@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
    implements ICommandHandler<RefreshTokenCommand, RefreshResult>
{
    constructor(
        private readonly jwtTokensService: JwtTokensService,
        private readonly securityDevicesRepository: SecurityDevicesRepository,
        private readonly usersRepository: UsersRepository,
    ) {}

    async execute(command: RefreshTokenCommand): Promise<RefreshResult> {
        const device = await this.securityDevicesRepository.findByDeviceId(
            command.deviceId,
        );
        if (!device) throw new UnauthorizedException();

        const user = await this.usersRepository.findById(command.userId);
        if (!user) throw new UnauthorizedException();

        const { token: refreshToken, decoded } =
            this.jwtTokensService.createRefreshToken({
                userId: command.userId,
                deviceId: command.deviceId,
            });

        device.updateActivity(
            new Date(decoded.iat * 1000).toISOString(),
            command.ip,
            command.userAgent,
        );
        await this.securityDevicesRepository.save(device);

        const accessToken = this.jwtTokensService.createAccessToken({
            userId: command.userId,
            login: user.login,
        });

        return { accessToken, refreshToken };
    }
}