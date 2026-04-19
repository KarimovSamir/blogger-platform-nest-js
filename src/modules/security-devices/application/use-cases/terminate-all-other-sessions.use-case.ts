import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';

// Команда — это просто DTO, описывающий "что нужно сделать".
// Контроллер создаёт её: new TerminateAllOtherSessionsCommand(userId, deviceId)
// и кидает в commandBus.execute().
export class TerminateAllOtherSessionsCommand {
    constructor(
        public readonly userId: string,
        public readonly currentDeviceId: string,
    ) { }
}

// Handler связывается с командой через декоратор.
// CQRS сам разрулит, какой handler вызвать для какой команды.
@CommandHandler(TerminateAllOtherSessionsCommand)
export class TerminateAllOtherSessionsUseCase
    implements ICommandHandler<TerminateAllOtherSessionsCommand, void> {
    constructor(
        private readonly securityDevicesRepository: SecurityDevicesRepository,
    ) { }

    async execute(command: TerminateAllOtherSessionsCommand): Promise<void> {
        await this.securityDevicesRepository.deleteAllExceptCurrent(
            command.userId,
            command.currentDeviceId,
        );
    }
}