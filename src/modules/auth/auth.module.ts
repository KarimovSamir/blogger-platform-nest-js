import { Module } from '@nestjs/common';
import { LocalStrategy } from './guards/local/local.strategy';
import { AuthController } from './api/auth.controller';
import { AuthService } from './application/auth.service';
import { JwtStrategy } from './guards/jwt/jwt.strategy';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { JwtService } from '../../core/adapters/jwt.service';
import { MailerService } from '../../core/adapters/resend.mailer';
import { BcryptService } from '../../core/adapters/bcrypt.service';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [UsersModule],
    controllers: [AuthController],
    providers: [
        AuthService, 
        LocalStrategy,
        JwtStrategy,
        BcryptService,
        MailerService,
        JwtService,
    ],
})
export class AuthModule {}