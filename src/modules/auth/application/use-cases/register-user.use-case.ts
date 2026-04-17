import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { RegistrationAuthDto } from '../../api/input-dto/registration.input-dto';
import { User, type UserModelType } from '../../../users/domain/user.entity';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BcryptService } from '../../../../core/adapters/bcrypt.service';
import { MailerService } from '../../../../core/adapters/resend.mailer';

export class RegisterUserCommand {
    constructor(public dto: RegistrationAuthDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<RegisterUserCommand, void> {
    constructor(
        @InjectModel(User.name) private userModel: UserModelType,
        private userRepository: UsersRepository,
        private bcryptService: BcryptService,
        private mailerService: MailerService,
        private configService: ConfigService,
    ) {}

    async execute(command: RegisterUserCommand): Promise<void> {
        const { dto } = command;
        const user = await this.userRepository.findByLoginOrEmail(
            dto.login.trim(),
            dto.email.trim().toLowerCase()
        );

        if (user) {
            if (user.email === dto.email) {
                throw new BadRequestException({ message: 'Email already used', field: 'email' });
            } else {
                throw new BadRequestException({ message: 'Login already used', field: 'login' });
            }
        }

        const hashCode = await this.bcryptService.generateHash(dto.password);
        const codeUUID = randomUUID();
        const dateNow = new Date(Date.now() + 15 * 60 * 1000);
        
        const userRegMail = {
            login: dto.login,
            email: dto.email,
            passwordHash: hashCode.toString(),
            confirmationCode: codeUUID.toString(),
            expirationDate: dateNow,
        };

        const baseUrl = this.configService.get<string>('FRONTEND_CONFIRM_URL');
        const confirmLink = `${baseUrl}?code=${codeUUID}`;

        const userCreate = this.userModel.createInstance(userRegMail);
        await this.userRepository.save(userCreate);

        await this.mailerService.send({
            to: dto.email,
            subject: "Confirm your registration",
            html: `<h1>Thank for your registration</h1>
                   <p>To finish registration please follow the link below:
                   <a href="${confirmLink}">complete registration</a></p>`,
        });
    }
}