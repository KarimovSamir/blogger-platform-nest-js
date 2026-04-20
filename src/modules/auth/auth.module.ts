import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '../users/users.module';

import { AuthController } from './api/auth.controller';
import { LocalStrategy } from './guards/local/local.strategy';
import { JwtStrategy } from './guards/jwt/jwt.strategy';

import { MailerService } from '../../core/adapters/resend.mailer';
import { BcryptService } from '../../core/adapters/bcrypt.service';

// --- ИМПОРТЫ ВСЕХ USE CASES ---
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { ConfirmEmailUseCase } from './application/use-cases/confirm-email.use-case';
import { ResendEmailUseCase } from './application/use-cases/resend-email.use-case';
import { PasswordRecoveryUseCase } from './application/use-cases/password-recovery.use-case';
import { NewPasswordUseCase } from './application/use-cases/new-password.use-case';
import { SecurityDevicesModule } from '../security-devices/security-devices.module';
import { JwtRefreshStrategy } from './guards/jwt/jwt-refresh.strategy';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { JwtTokensService } from '../../core/adapters/jwt-tokens.service';

const useCases = [
    LoginUserUseCase,
    RegisterUserUseCase,
    ConfirmEmailUseCase,
    ResendEmailUseCase,
    PasswordRecoveryUseCase,
    NewPasswordUseCase,
    RefreshTokenUseCase,
    LogoutUseCase
];

@Module({
    imports: [
        UsersModule,
        CqrsModule, 
        PassportModule,
        JwtModule.register({}), // Базовый модуль JWT
        SecurityDevicesModule,
    ],
    controllers: [
        AuthController,
    ],
    providers: [
        LocalStrategy,
        JwtStrategy,
        BcryptService,
        MailerService,
        JwtRefreshStrategy,
        JwtTokensService,
        ...useCases, // Разворачиваем все юзкейсы
    ],
})
export class AuthModule {}