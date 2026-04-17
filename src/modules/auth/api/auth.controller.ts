import {
    Controller, Post, Body, Get, HttpCode, HttpStatus, UseGuards, Request, UnauthorizedException, Res,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import type { Response } from 'express';

import { UsersRepository } from '../../users/infrastructure/users.repository';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt/jwt-auth.guard';

// Импорты DTO
import { RegistrationAuthDto } from './input-dto/registration.input-dto';
import { RegistrationConfirmationAuthDto } from './input-dto/registration-confirmation.input-dto';
import { RegistrationEmailResendingAuthDto } from './input-dto/registration-email-resending.input-dto';
import { PasswordRecoveryAuthDto } from './input-dto/password-recovery.input-dto';
import { NewEmailPasswordRecoveryAttributes } from './input-dto/new-password.input-dto';

// Импорты Команд (убедись, что пути до файлов правильные)
import { LoginUserCommand } from '../application/use-cases/login-user.use-case';
import { RegisterUserCommand } from '../application/use-cases/register-user.use-case';
import { ConfirmEmailCommand } from '../application/use-cases/confirm-email.use-case';
import { ResendEmailCommand } from '../application/use-cases/resend-email.use-case';
import { PasswordRecoveryCommand } from '../application/use-cases/password-recovery.use-case';
import { NewPasswordCommand } from '../application/use-cases/new-password.use-case';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly commandBus: CommandBus,
    ) {}

    @Post('registration')
    @HttpCode(HttpStatus.NO_CONTENT)
    async registration(@Body() dto: RegistrationAuthDto) {
        await this.commandBus.execute(new RegisterUserCommand(dto));
    }

    @Post('registration-confirmation')
    @HttpCode(HttpStatus.NO_CONTENT)
    async registrationConfirmation(
        @Body() dto: RegistrationConfirmationAuthDto,
    ) {
        await this.commandBus.execute(new ConfirmEmailCommand(dto.code));
    }

    @Post('registration-email-resending')
    @HttpCode(HttpStatus.NO_CONTENT)
    async registrationEmailResending(
        @Body() dto: RegistrationEmailResendingAuthDto,
    ) {
        await this.commandBus.execute(new ResendEmailCommand(dto.email));
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Request() req: any,
        @Res({ passthrough: true }) res: Response,
    ) {
        // req.user.id приходит из LocalStrategy -> validate
        const userId = req.user.id;

        const tokens = await this.commandBus.execute(
            new LoginUserCommand(userId),
        );

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: true, 
        });

        return { accessToken: tokens.accessToken };
    }

    @Post('password-recovery')
    @HttpCode(HttpStatus.NO_CONTENT)
    async passwordRecovery(@Body() dto: PasswordRecoveryAuthDto) {
        await this.commandBus.execute(new PasswordRecoveryCommand(dto.email));
    }

    @Post('new-password')
    @HttpCode(HttpStatus.NO_CONTENT)
    async newPassword(@Body() dto: NewEmailPasswordRecoveryAttributes) {
        await this.commandBus.execute(new NewPasswordCommand(dto));
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
            userId: user._id.toString(),
        };
    }
}