import { Module } from '@nestjs/common';
import { LocalStrategy } from './guards/local/local.strategy';
import { AuthController } from './api/auth.controller';
import { AuthService } from './application/auth.service';
import { JwtStrategy } from './guards/jwt/jwt.strategy';
import { MailerService } from '../../core/adapters/resend.mailer';
import { BcryptService } from '../../core/adapters/bcrypt.service';
import { UsersModule } from '../users/users.module';
import { CqrsModule } from '@nestjs/cqrs';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN, REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from './auth.constants';
import { ConfigService } from '@nestjs/config';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { JwtModule, JwtService } from '@nestjs/jwt';

const useCases = [LoginUserUseCase]; // Собираем UseCases в массив для удобства

@Module({
    imports: [
        UsersModule,
        CqrsModule, 
        JwtModule.register({}), // <-- Регистрируем базовый модуль
    ],
    controllers: [
        AuthController,
    ],
    providers: [
        AuthService, 
        LocalStrategy,
        JwtStrategy,
        BcryptService,
        MailerService,
        ...useCases,

        // --- Фабрики для JWT ---
        {
            provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
            useFactory: (configService: ConfigService): JwtService => {
                return new JwtService({
                    secret: configService.getOrThrow<string>('AC_SECRET'),
                    signOptions: { expiresIn: parseInt(configService.getOrThrow<string>('AC_TIME'), 10) },
                });
            },
            inject: [ConfigService], // <-- Указываем, что фабрике нужен ConfigService
        },
        {
            provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
            useFactory: (configService: ConfigService): JwtService => {
                return new JwtService({
                    secret: configService.getOrThrow<string>('RT_SECRET'),
                    signOptions: { expiresIn: parseInt(configService.getOrThrow<string>('RT_TIME'), 10) },
                });
            },
            inject: [ConfigService],
        },
    ],
})
export class AuthModule {}