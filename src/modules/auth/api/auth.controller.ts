import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { RegistrationAuthDto } from './input-dto/registration.input-dto';
import { LoginAuthDto } from './input-dto/login.input-dto';
import { RegistrationConfirmationAuthDto } from './input-dto/registration-confirmation.input-dto';
import { RegistrationEmailResendingAuthDto } from './input-dto/registration-email-resending.input-dto';
import { PasswordRecoveryAuthDto } from './input-dto/password-recovery.input-dto';
import { NewEmailPasswordRecoveryAttributes } from './input-dto/new-password.input-dto';
import { AuthService } from '../application/auth.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}

    @Post('registration')
    @HttpCode(HttpStatus.NO_CONTENT)
    async registration(@Body() dto: RegistrationAuthDto) {
        await this.authService.registerMail(dto);
    }

    @Post('registration-confirmation')
    @HttpCode(HttpStatus.NO_CONTENT)
    async registrationConfirmation(@Body() dto: RegistrationConfirmationAuthDto) {
        await this.authService.confirmEmailByCode(dto.code);
    }

    @Post('registration-email-resending')
    @HttpCode(HttpStatus.NO_CONTENT)
    async registrationEmailResending(@Body() dto: RegistrationEmailResendingAuthDto) {
        await this.authService.resendingMail(dto.email);
    }

    @Post('login')
    async login(@Body() dto: LoginAuthDto) {
        // вызов authService, возвращает { accessToken }
    }

    @Post('password-recovery')
    @HttpCode(HttpStatus.NO_CONTENT)
    async passwordRecovery(@Body() dto: PasswordRecoveryAuthDto) {
        await this.authService.emailPasswordRecovery(dto.email);
    }

    @Post('new-password')
    @HttpCode(HttpStatus.NO_CONTENT)
    async newPassword(@Body() dto: NewEmailPasswordRecoveryAttributes) {
        await this.authService.newPassword(dto);
    }

    @Get('me')
    async me() {
        // вернуть данные текущего пользователя (bearer auth — следующий спринт)
    }
}