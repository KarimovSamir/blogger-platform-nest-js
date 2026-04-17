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

const useCases = [
    LoginUserUseCase,
    RegisterUserUseCase,
    ConfirmEmailUseCase,
    ResendEmailUseCase,
    PasswordRecoveryUseCase,
    NewPasswordUseCase
];

@Module({
    imports: [
        UsersModule,
        CqrsModule, 
        PassportModule,
        JwtModule.register({}), // Базовый модуль JWT
    ],
    controllers: [
        AuthController,
    ],
    providers: [
        LocalStrategy,
        JwtStrategy,
        BcryptService,
        MailerService,
        ...useCases, // Разворачиваем все юзкейсы
    ],
})
export class AuthModule {}