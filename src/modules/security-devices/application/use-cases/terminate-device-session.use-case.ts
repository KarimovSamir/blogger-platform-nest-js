import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';

export class TerminateDeviceSessionCommand {
    constructor(
        public readonly currentUserId: string,    // кто просит удалить (из токена)
        public readonly targetDeviceId: string,   // что хочет удалить (из URL)
    ) { }
}

@CommandHandler(TerminateDeviceSessionCommand)
export class TerminateDeviceSessionUseCase
    implements ICommandHandler<TerminateDeviceSessionCommand, void> {
    constructor(
        private readonly securityDevicesRepository: SecurityDevicesRepository,
    ) { }

    async execute(command: TerminateDeviceSessionCommand): Promise<void> {
        // ищем сессию.
        const device = await this.securityDevicesRepository.findByDeviceId(
            command.targetDeviceId,
        );

        // существует ли сессия
        if (!device) {
            throw new NotFoundException('Device session not found');
        }

        // сессия существует, но принадлежит другому юзеру — 403.
        if (device.userId !== command.currentUserId) {
            throw new ForbiddenException('You cannot terminate another user session');
        }

        // удаляем, если всё окей
        await this.securityDevicesRepository.deleteByDeviceId(command.targetDeviceId);
    }
}