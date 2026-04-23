import {
    Controller, Post, Body, Get, HttpCode, HttpStatus, UseGuards, Request, UnauthorizedException, Res,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import type { Response } from 'express';
// это ограничитель на количество запросов от одного источника за единицу времени (rate limit)
// import { ThrottlerGuard } from '@nestjs/throttler';

import { UsersRepository } from '../../users/infrastructure/users.repository';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt/jwt-auth.guard';

import { RegistrationAuthDto } from './input-dto/registration.input-dto';
import { RegistrationConfirmationAuthDto } from './input-dto/registration-confirmation.input-dto';
import { RegistrationEmailResendingAuthDto } from './input-dto/registration-email-resending.input-dto';
import { PasswordRecoveryAuthDto } from './input-dto/password-recovery.input-dto';
import { NewEmailPasswordRecoveryAttributes } from './input-dto/new-password.input-dto';

import { LoginUserCommand } from '../application/use-cases/login-user.use-case';
import { RegisterUserCommand } from '../application/use-cases/register-user.use-case';
import { ConfirmEmailCommand } from '../application/use-cases/confirm-email.use-case';
import { ResendEmailCommand } from '../application/use-cases/resend-email.use-case';
import { PasswordRecoveryCommand } from '../application/use-cases/password-recovery.use-case';
import { NewPasswordCommand } from '../application/use-cases/new-password.use-case';
import { JwtRefreshAuthGuard } from '../guards/jwt/jwt-refresh-auth.guard';
import { RefreshTokenCommand } from '../application/use-cases/refresh-token.use-case';
import { LogoutCommand } from '../application/use-cases/logout.use-case';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly commandBus: CommandBus,
    ) { }

    @UseGuards(ThrottlerGuard)
    @Post('registration')
    @HttpCode(HttpStatus.NO_CONTENT)
    async registration(@Body() dto: RegistrationAuthDto) {
        await this.commandBus.execute(new RegisterUserCommand(dto));
    }

    @UseGuards(ThrottlerGuard)
    @Post('registration-confirmation')
    @HttpCode(HttpStatus.NO_CONTENT)
    async registrationConfirmation(
        @Body() dto: RegistrationConfirmationAuthDto,
    ) {
        await this.commandBus.execute(new ConfirmEmailCommand(dto.code));
    }

    @UseGuards(ThrottlerGuard)
    @Post('registration-email-resending')
    @HttpCode(HttpStatus.NO_CONTENT)
    async registrationEmailResending(
        @Body() dto: RegistrationEmailResendingAuthDto,
    ) {
        await this.commandBus.execute(new ResendEmailCommand(dto.email));
    }

    @UseGuards(ThrottlerGuard, LocalAuthGuard)
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Request() req: any,
        @Res({ passthrough: true }) res: Response,
    ) {
        const userId = req.user.id;
        const login = req.user.login;

        // Достаём метаданные соединения.
        // req.ip может прийти как '::ffff:127.0.0.1' — это нормально (IPv4 внутри IPv6).
        const ip = req.ip || req.socket?.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        const tokens = await this.commandBus.execute(
            new LoginUserCommand(userId, login, ip, userAgent),
        );

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: true,
        });

        return { accessToken: tokens.accessToken };
    }

    @UseGuards(ThrottlerGuard)
    @Post('password-recovery')
    @HttpCode(HttpStatus.NO_CONTENT)
    async passwordRecovery(@Body() dto: PasswordRecoveryAuthDto) {
        await this.commandBus.execute(new PasswordRecoveryCommand(dto.email));
    }

    @UseGuards(ThrottlerGuard)
    @Post('new-password')
    @HttpCode(HttpStatus.NO_CONTENT)
    async newPassword(@Body() dto: NewEmailPasswordRecoveryAttributes) {
        await this.commandBus.execute(new NewPasswordCommand(dto));
    }

    @UseGuards(JwtRefreshAuthGuard)
    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    async refreshToken(
        @Request() req: any,
        @Res({ passthrough: true }) res: Response,
    ) {
        // req.user положила сюда JwtRefreshStrategy.validate().
        // Там была проверка и подписи, и срока, и актуальности через lastActiveDate.
        const userId = req.user.userId;
        const deviceId = req.user.deviceId;

        const ip = req.ip || req.socket?.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        const tokens = await this.commandBus.execute(
            new RefreshTokenCommand(userId, deviceId, ip, userAgent),
        );

        // Перезаписываем куку новым refresh-токеном.
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: true,
        });

        return { accessToken: tokens.accessToken };
    }

    @UseGuards(JwtRefreshAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    async logout(
        @Request() req: any,
        @Res({ passthrough: true }) res: Response,
    ) {
        const deviceId = req.user.deviceId;

        await this.commandBus.execute(new LogoutCommand(deviceId));

        // Чистим куку на стороне клиента.
        // Флаги должны совпадать с теми, что были при res.cookie() —
        // иначе браузер не поймёт, какую именно куку ты хочешь удалить.
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async me(@Request() req: any) {
        // Зависит от того, как ты парсишь токен в JwtStrategy.
        // Обычно там кладут req.user.userId или req.user.id
        const userId = req.user.userId || req.user.id;
        const user = await this.usersRepository.findById(userId);

        if (!user) {
            throw new UnauthorizedException();
        }

        return {
            email: user.email,
            login: user.login,
            userId: user.id,
        };
    }
}