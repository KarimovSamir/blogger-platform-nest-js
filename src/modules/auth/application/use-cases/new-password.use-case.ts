import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { NewEmailPasswordRecoveryAttributes } from '../../api/input-dto/new-password.input-dto';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BcryptService } from '../../../../core/adapters/bcrypt.service';

export class NewPasswordCommand {
    constructor(public dto: NewEmailPasswordRecoveryAttributes) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<NewPasswordCommand, void> {
    constructor(
        private userRepository: UsersRepository,
        private bcryptService: BcryptService,
    ) {}

    async execute(command: NewPasswordCommand): Promise<void> {
        const { dto } = command;
        const user = await this.userRepository.findByPasswordRecoveryCode(dto.recoveryCode.trim());
        
        if (!user || !user.passwordRecovery.expirationDate || user.passwordRecovery.expirationDate < new Date()) {
            throw new BadRequestException({ message: 'Code is invalid', field: 'recoveryCode' });
        }

        const newPasswordHash = await this.bcryptService.generateHash(dto.newPassword);
        user.updatePassword(newPasswordHash);
        await this.userRepository.save(user);
    }
}