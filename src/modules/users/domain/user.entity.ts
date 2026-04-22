import { CreateUserDomainDto } from './dto/create-user.domain.dto';

// Больше никаких @Schema, @Prop и Mongoose-импортов.
// Это просто TypeScript класс, который описывает структуру строки в таблице users.
export class User {
    // id теперь явное поле — PostgreSQL генерирует UUID сам (DEFAULT gen_random_uuid())
    id: string;

    login: string;
    passwordHash: string;
    email: string;
    deletedAt: Date | null;
    isEmailConfirmed: boolean;

    emailConfirmation: {
        confirmationCode: string | null;
        expirationDate: Date | null;
        isConfirmed: boolean;
    };

    passwordRecovery: {
        recoveryCode: string | null;
        expirationDate: Date | null;
    };

    createdAt: Date;
    updatedAt: Date;

    // Паттерн Фабрика (инкапсуляция логики создания)
    // Static потому что для вызова нам не нужен объект User.createInstance()
    static createInstance(dto: CreateUserDomainDto): User {
        const user = new User();
        user.login = dto.login;
        user.email = dto.email;
        user.passwordHash = dto.passwordHash;

        // Если флаг передали - используем его, иначе false
        user.isEmailConfirmed = dto.isEmailConfirmed ?? false;

        user.emailConfirmation = {
            confirmationCode: dto.confirmationCode ?? null,
            expirationDate: dto.expirationDate ?? null,
            isConfirmed: user.isEmailConfirmed,
        };

        user.passwordRecovery = {
            recoveryCode: null,
            expirationDate: null,
        };

        // id не задаём — PostgreSQL сгенерирует его сам при INSERT
        return user;
    }

    update(dto: { email: string }) {
        if (dto.email !== this.email) {
            // По логике курса, при смене почты она снова не подтверждена
            this.isEmailConfirmed = false;
            this.email = dto.email;
        }
    }

    // Метод для мягкого удаления
    makeDeleted() {
        if (this.deletedAt !== null) {
            throw new Error('Entity already deleted');
        }
        this.deletedAt = new Date();
    }

    setConfirmationCode(confirmationCode: string, expirationDate: Date) {
        this.emailConfirmation.confirmationCode = confirmationCode;
        this.emailConfirmation.expirationDate = expirationDate;
        this.emailConfirmation.isConfirmed = false;
    }

    setPasswordRecovery(recoveryCode: string, expirationDate: Date) {
        this.passwordRecovery.recoveryCode = recoveryCode;
        this.passwordRecovery.expirationDate = expirationDate;
    }

    confirmEmail() {
        this.emailConfirmation.isConfirmed = true;
    }

    updatePassword(newPasswordHash: string) {
        this.passwordHash = newPasswordHash;
        this.passwordRecovery.recoveryCode = null;
        this.passwordRecovery.expirationDate = null;
    }
}

// UserDocument больше не нужен — это был Mongoose-специфичный тип.
// Везде где раньше был UserDocument, теперь просто User.
// UserModelType тоже удаляем по той же причине.