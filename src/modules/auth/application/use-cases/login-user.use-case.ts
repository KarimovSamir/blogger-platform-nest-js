import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export class LoginUserCommand {
    constructor(public userId: string, public login: string) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
    constructor(
        private jwtService: JwtService, 
        private configService: ConfigService
    ) {}

    async execute(command: LoginUserCommand): Promise<{ accessToken: string, refreshToken: string }> {
        // 1. Достаем userId из команды! <-- ИСПРАВЛЕНИЕ ЗДЕСЬ
        const { userId, login } = command; 

        // 2. Достаем секреты
        const acSecret = this.configService.getOrThrow<string>('AC_SECRET');
        const rtSecret = this.configService.getOrThrow<string>('RT_SECRET');

        // 3. Достаем время и переводим в число
        const acTime = parseInt(this.configService.getOrThrow<string>('AC_TIME'), 10);
        const rtTime = parseInt(this.configService.getOrThrow<string>('RT_TIME'), 10);

        // 4. Генерируем Access Token (теперь userId доступен)
        const accessToken = await this.jwtService.signAsync(
            { userId, login },
            { secret: acSecret, expiresIn: acTime }
        );

        // 5. Генерируем Refresh Token
        const refreshToken = await this.jwtService.signAsync(
            { userId: userId, deviceId: "some-device-id" }, 
            { secret: rtSecret, expiresIn: rtTime }
        );

        return { accessToken, refreshToken };
    }
}