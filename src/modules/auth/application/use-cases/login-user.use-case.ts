import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN, REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from '../../auth.constants';

// Паттерн команда (Коробка с данными)
export class LoginUserCommand {
    constructor(public userId: string) {}
}

// Обработчик команды
@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
    constructor(
        @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
        private accessTokenService: JwtService,

        @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
        private refreshTokenService: JwtService,
    ) {}

    async execute(command: LoginUserCommand): Promise<{ accessToken: string, refreshToken: string }> {
        const accessToken = this.accessTokenService.sign({ userId: command.userId });
        // В будущем тут добавится deviceId, пока делаем заглушку, как требует задание
        const refreshToken = this.refreshTokenService.sign({ userId: command.userId, deviceId: 'dummy-device-id' });

        return {
            accessToken,
            refreshToken
        };
    }
}