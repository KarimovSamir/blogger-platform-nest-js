import {
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Req,
    UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import type { Request } from 'express';
import { SecurityDevicesQueryRepository } from '../infrastructure/query/security-devices.query-repository';
import { DeviceViewDto } from './view-dto/device.view-dto';
import { TerminateAllOtherSessionsCommand } from '../application/use-cases/terminate-all-other-sessions.use-case';
import { TerminateDeviceSessionCommand } from '../application/use-cases/terminate-device-session.use-case';
import { JwtRefreshAuthGuard } from '../../auth/guards/jwt/jwt-refresh-auth.guard';

// Описываем форму объекта, который guard положит в req.user после валидации refresh-токена.
// На шаге 3 мы эту форму обеспечим.
interface RefreshTokenPayload {
    userId: string;
    deviceId: string;
}

@Controller('security/devices')
@UseGuards(JwtRefreshAuthGuard)
export class SecurityDevicesController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly securityDevicesQueryRepository: SecurityDevicesQueryRepository,
    ) { }

    @Get()
    async getAllDevices(@Req() req: Request): Promise<DeviceViewDto[]> {
        const user = req.user as RefreshTokenPayload;
        return this.securityDevicesQueryRepository.findAllByUserId(user.userId);
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    async terminateAllOtherSessions(@Req() req: Request): Promise<void> {
        const user = req.user as RefreshTokenPayload;
        await this.commandBus.execute(
            new TerminateAllOtherSessionsCommand(user.userId, user.deviceId),
        );
    }

    @Delete(':deviceId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async terminateDeviceSession(
        @Param('deviceId') deviceId: string,
        @Req() req: Request,
    ): Promise<void> {
        const user = req.user as RefreshTokenPayload;
        await this.commandBus.execute(
            new TerminateDeviceSessionCommand(user.userId, deviceId),
        );
    }
}