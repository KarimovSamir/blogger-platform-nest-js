import {
    Controller,
    Post,
    Body,
    Get,
    HttpCode,
    HttpStatus,
    UseGuards,
    Request,
    UnauthorizedException,
    Res,
} from '@nestjs/common';
import { RegistrationAuthDto } from './input-dto/registration.input-dto';
import { RegistrationConfirmationAuthDto } from './input-dto/registration-confirmation.input-dto';
import { RegistrationEmailResendingAuthDto } from './input-dto/registration-email-resending.input-dto';
import { PasswordRecoveryAuthDto } from './input-dto/password-recovery.input-dto';
import { NewEmailPasswordRecoveryAttributes } from './input-dto/new-password.input-dto';
import { AuthService } from '../application/auth.service';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { JwtAuthGuard } from '../guards/jwt/jwt-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { LoginUserCommand } from '../application/use-cases/login-user.use-case';
import type { Response } from 'express';


@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersRepository: UsersRepository,
        private readonly commandBus: CommandBus,
    ) {}

    @Post('registration')
    @HttpCode(HttpStatus.NO_CONTENT)
    async registration(@Body() dto: RegistrationAuthDto) {
        await this.authService.registerMail(dto);
    }

    @Post('registration-confirmation')
    @HttpCode(HttpStatus.NO_CONTENT)
    async registrationConfirmation(
        @Body() dto: RegistrationConfirmationAuthDto,
    ) {
        await this.authService.confirmEmailByCode(dto.code);
    }

    @Post('registration-email-resending')
    @HttpCode(HttpStatus.NO_CONTENT)
    async registrationEmailResending(
        @Body() dto: RegistrationEmailResendingAuthDto,
    ) {
        await this.authService.resendingMail(dto.email);
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Request() req: any,
        // без passthrough NestJS отключает свою магию и для res придётся вызывать res.send()
        @Res({ passthrough: true }) res: Response,
    ) {
        // return this.authService.loginUser(req.user.id);
        const userId = req.user.id;

        // Отправляем команду в шину
        const tokens = await this.commandBus.execute(
            new LoginUserCommand(userId),
        );

        // Устанавливаем refreshToken в куки
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: true, // В идеале зависит от NODE_ENV (для локалки можно false, если не https)
            // maxAge можно задать, если нужно
        });

        // Возвращаем только accessToken в теле
        return { accessToken: tokens.accessToken };
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

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async me(@Request() req: any) {
        const userId = req.user.userId;
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
