import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { MailerService } from '../../../../core/adapters/resend.mailer';

export class ResendEmailCommand {
    constructor(public email: string) {}
}

@CommandHandler(ResendEmailCommand)
export class ResendEmailUseCase implements ICommandHandler<ResendEmailCommand, void> {
    constructor(
        private userRepository: UsersRepository,
        private mailerService: MailerService,
        private configService: ConfigService,
    ) {}

    async execute(command: ResendEmailCommand): Promise<void> {
        const email = command.email.trim().toLowerCase();
        const user = await this.userRepository.findByLoginOrEmail('', email);
        
        if (!user || user.emailConfirmation.isConfirmed) {
            throw new BadRequestException({ message: 'Email already confirmed', field: 'email' });
        }

        const codeUUID = randomUUID();
        const dateNow = new Date(Date.now() + 15 * 60 * 1000);
        user.setConfirmationCode(codeUUID, dateNow);
        await this.userRepository.save(user);

        const baseUrl = this.configService.get<string>('FRONTEND_CONFIRM_URL');
        const confirmLink = `${baseUrl}?code=${codeUUID}`;

        await this.mailerService.send({
            to: email,
            subject: "Confirm your registration",
            html: `<h1>Thank for your registration</h1>
                   <p>To finish registration please follow the link below:
                   <a href="${confirmLink}">complete registration</a></p>`,
        });
    }
}