import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

export class ConfirmEmailCommand {
    constructor(public code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase implements ICommandHandler<ConfirmEmailCommand, void> {
    constructor(private userRepository: UsersRepository) {}

    async execute(command: ConfirmEmailCommand): Promise<void> {
        const user = await this.userRepository.findByConfirmationCode(command.code);
        
        if (!user || !user.emailConfirmation) {
            throw new BadRequestException({ message: 'Code is invalid', field: 'code' });
        }
        if (user.emailConfirmation.isConfirmed) {
            throw new BadRequestException({ message: 'Email already confirmed', field: 'code' });
        }
        if (!user.emailConfirmation.expirationDate || user.emailConfirmation.expirationDate < new Date()) {
            throw new BadRequestException({ message: 'Code is expired', field: 'code' });
        }

        user.confirmEmail();
        await this.userRepository.save(user);
    }
}