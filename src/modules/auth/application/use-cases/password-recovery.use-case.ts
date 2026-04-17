import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { MailerService } from '../../../../core/adapters/resend.mailer';

export class PasswordRecoveryCommand {
    constructor(public email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase implements ICommandHandler<PasswordRecoveryCommand, void> {
    constructor(
        private userRepository: UsersRepository,
        private mailerService: MailerService,
        private configService: ConfigService,
    ) {}

    async execute(command: PasswordRecoveryCommand): Promise<void> {
        const email = command.email.trim().toLowerCase();
        const user = await this.userRepository.findByLoginOrEmail('', email);
        
        if (!user) return; // По доке мы не возвращаем ошибку, если юзера нет

        const codeUUID = randomUUID();
        const dateNow = new Date(Date.now() + 15 * 60 * 1000);
        user.setPasswordRecovery(codeUUID, dateNow);
        await this.userRepository.save(user);

        const baseUrl = this.configService.get<string>('FRONTEND_RECOVERY_CODE_URL');
        const confirmLink = `${baseUrl}?recoveryCode=${codeUUID}`;

        await this.mailerService.send({
            to: email,
            subject: "Confirm your password recovery",
            html: `<h1>Password recovery</h1>
                   <p>To finish password recovery please follow the link below:
                   <a href="${confirmLink}">recovery password</a></p>`,
        });
    }
}