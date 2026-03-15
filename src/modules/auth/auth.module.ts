import { Module } from '@nestjs/common';
import { LocalStrategy } from './guards/local/local.strategy';
import { AuthController } from './api/auth.controller';
import { AuthService } from './application/auth.service';

@Module({
    controllers: [AuthController],
    providers: [
        AuthService, 
        LocalStrategy
    ],
})
export class AuthModule {}