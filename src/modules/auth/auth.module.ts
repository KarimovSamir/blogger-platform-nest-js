import { Module } from '@nestjs/common';
import { LocalStrategy } from './guards/local/local.strategy';
import { AuthController } from './api/auth.controller';
import { AuthService } from './application/auth.service';
import { JwtStrategy } from './guards/jwt/jwt.strategy';

@Module({
    controllers: [AuthController],
    providers: [
        AuthService, 
        LocalStrategy,
        JwtStrategy
    ],
})
export class AuthModule {}