import { BadRequestException, Injectable } from "@nestjs/common";
import { UsersRepository } from "../../users/infrastructure/users.repository";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../../users/domain/user.entity";
import type { UserModelType } from "../../users/domain/user.entity";
import { BcryptService } from "../../../core/adapters/bcrypt.service";
import { MailerService } from "../../../core/adapters/resend.mailer";
import { RegistrationAuthDto } from "../api/input-dto/registration.input-dto";
import { randomUUID } from "crypto";
import { ConfigService } from "@nestjs/config";
import { NewEmailPasswordRecoveryAttributes } from "../api/input-dto/new-password.input-dto";

@Injectable()
export class AuthService {
    constructor(
        // чтобы иметь доступ к фабрике createInstance
        @InjectModel(User.name) private userModel: UserModelType,
        // чтобы искать пользователей (проверка на дубликаты) и сохранять новых
        private userRepository: UsersRepository,
        // чтобы захэшировать пароль из DTO
        private bcryptService: BcryptService,
        // чтобы отправить письмо с кодом
        private mailerService: MailerService,
        private configService: ConfigService
    ) { }

    async registerMail(dto: RegistrationAuthDto): Promise<void> {
        const user = await this.userRepository.findByLoginOrEmail(
            dto.login.trim(),
            dto.email.trim().toLowerCase()
        )
        if (user) {
            throw new BadRequestException('Login or email already used');
        };
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
        
        // Формируем итоговую ссылку с query-параметром code
        const confirmLink = `${baseUrl}?code=${codeUUID}`;

        const userCreate = this.userModel.createInstance(userRegMail);
        await this.userRepository.save(userCreate);
        await this.mailerService.send({
            to: dto.email,
            subject: "Confirm your registration",
            html: `
                <h1>Thank for your registration</h1>
                <p>To finish registration please follow the link below:
                <a href="${confirmLink}">complete registration</a>
                </p>
            `,
        });
    }

    async confirmEmailByCode(code: string): Promise<void> {
        const user = await this.userRepository.findByConfirmationCode(code);
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

    async resendingMail(email: string): Promise<void> {
        const user = await this.userRepository.findByLoginOrEmail(
            '',
            email.trim().toLowerCase()
        )
        if (!user || user.emailConfirmation.isConfirmed) {
            throw new BadRequestException({ message: 'Email already confirmed', field: 'email' });
        }
        const codeUUID = randomUUID();
        const dateNow = new Date(Date.now() + 15 * 60 * 1000);
        // const userEmail = email.trim().toLowerCase();
        user.setConfirmationCode(codeUUID,dateNow);
        await this.userRepository.save(user);

        const baseUrl = this.configService.get<string>('FRONTEND_CONFIRM_URL');
        const confirmLink = `${baseUrl}?code=${codeUUID}`;

        await this.mailerService.send({
            to: email,
            subject: "Confirm your registration",
            html: `
                <h1>Thank for your registration</h1>
                <p>To finish registration please follow the link below:
                <a href="${confirmLink}">complete registration</a>
                </p>
            `,
        });
    }

    async emailPasswordRecovery(email: string): Promise<void> {
        const user = await this.userRepository.findByLoginOrEmail(
            '',
            email.trim().toLowerCase()
        )
        if (!user) {
            return;
        }
        const codeUUID = randomUUID();
        const dateNow = new Date(Date.now() + 15 * 60 * 1000);
        user.setPasswordRecovery(codeUUID, dateNow);
        await this.userRepository.save(user);
        const baseUrl = this.configService.get<string>('FRONTEND_RECOVERY_CODE_URL');
        const confirmLink = `${baseUrl}?recoveryCode=${codeUUID}`;

        await this.mailerService.send({
            to: email,
            subject: "Confirm your password recovery",
            html: `
                <h1>Password recovery</h1>
                <p>To finish password recovery please follow the link below:
                <a href="${confirmLink}">recovery password</a>
                </p>
            `,
        });
    }

    async newPassword(dto: NewEmailPasswordRecoveryAttributes): Promise<void> {
        const user = await this.userRepository.findByPasswordRecoveryCode(
            dto.recoveryCode.trim()
        );
        if (!user) {
            throw new BadRequestException({ message: 'Code is invalid', field: 'recoveryCode' });
        };
        if (!user.passwordRecovery.expirationDate || user.passwordRecovery.expirationDate < new Date()) {
            throw new BadRequestException({ message: 'Code is invalid', field: 'recoveryCode' });
        }

        const newPasswordHash = await this.bcryptService.generateHash(dto.newPassword);
        user.updatePassword(newPasswordHash);
        await this.userRepository.save(user);
    }
}