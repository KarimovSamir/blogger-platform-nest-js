import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { SecurityDevicesRepository } from '../../../security-devices/infrastructure/security-devices.repository';

export class LogoutCommand {
    constructor(public readonly deviceId: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand, void> {
    constructor(
        private readonly securityDevicesRepository: SecurityDevicesRepository,
    ) {}

    async execute(command: LogoutCommand): Promise<void> {
        const device = await this.securityDevicesRepository.findByDeviceId(
            command.deviceId,
        );
        if (!device) throw new UnauthorizedException();

        await this.securityDevicesRepository.deleteByDeviceId(command.deviceId);
    }
}