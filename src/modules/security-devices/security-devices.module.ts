import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { SecurityDevicesController } from './api/security-devices.controller';
import { SecurityDevicesRepository } from './infrastructure/security-devices.repository';
import { SecurityDevicesQueryRepository } from './infrastructure/query/security-devices.query-repository';
import { TerminateAllOtherSessionsUseCase } from './application/use-cases/terminate-all-other-sessions.use-case';
import { TerminateDeviceSessionUseCase } from './application/use-cases/terminate-device-session.use-case';

const useCases = [
    TerminateAllOtherSessionsUseCase,
    TerminateDeviceSessionUseCase,
];

@Module({
    imports: [
        TypeOrmModule.forFeature([]),
        // чтобы работали @CommandHandler декораторы
        CqrsModule,
    ],
    controllers: [SecurityDevicesController],
    providers: [
        SecurityDevicesRepository,
        SecurityDevicesQueryRepository,
        ...useCases,
    ],
    // понадобится в AuthModule
    exports: [
        SecurityDevicesRepository,
        SecurityDevicesQueryRepository,
    ],
})
export class SecurityDevicesModule {}
