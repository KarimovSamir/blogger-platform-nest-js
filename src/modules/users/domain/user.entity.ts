import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateUserDomainDto } from './dto/create-user.domain.dto';

// Декоратор Schema говорит: "Этот класс — не просто объект, это описание коллекции для MongoDB"
// timestamps нужен, чтобы автоматически подставить текущее время в createdAt и updatedAt
@Schema({ timestamps: true })
export class User {
    // Декоратор Prop нужен для передачи настроек в БД
    @Prop({ type: String, required: true })
    login: string;

    @Prop({ type: String, required: true })
    passwordHash: string;

    @Prop({ type: String, required: true })
    email: string;

    @Prop({ type: Date, nullable: true, default: null })
    deletedAt: Date | null;

    @Prop({ type: Boolean, required: true, default: false })
    isEmailConfirmed: boolean;

    @Prop({
        type: {
            confirmationCode: { type: String, nullable: true },
            expirationDate: { type: Date, nullable: true },
            isConfirmed: Boolean,
        }
    })
    emailConfirmation: {
        confirmationCode: string | null;
        expirationDate: Date | null;
        isConfirmed: boolean;
    }

    @Prop({
        type: {
            recoveryCode: { type: String, nullable: true },
            expirationDate: { type: Date, nullable: true },
        }
    })
    passwordRecovery: {
        recoveryCode: string | null;
        expirationDate: Date | null;
    }

    // TypeScript должен знать что такие поля существуют, хоть мы и указали timestamps
    createdAt: Date;
    updatedAt: Date;

    // Паттерн Фабрика (инкапсуляция логики создания)
    // Static потому что для вызова нам не нужен объект User.createInstance()
    static createInstance(dto: CreateUserDomainDto): UserDocument {
        const user = new this();
        user.login = dto.login;
        user.email = dto.email;
        user.passwordHash = dto.passwordHash;
        user.isEmailConfirmed = false;

        // Если флаг передали - используем его, иначе false
        user.isEmailConfirmed = dto.isEmailConfirmed ?? false;

        user.emailConfirmation = {
            // Если кода нет, ставим null
            confirmationCode: dto.confirmationCode ?? null, 
            expirationDate: dto.expirationDate ?? null,
            isConfirmed: user.isEmailConfirmed,
        };

        user.passwordRecovery = {
            recoveryCode: null,
            expirationDate: null,
        };

        return user as UserDocument;
    }

    update(dto: { email: string }) {
        if (dto.email !== this.email) {
            this.isEmailConfirmed = false; // По логике курса, при смене почты она снова не подтверждена
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
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User); // Регистрируем методы в Mongoose

export type UserDocument = HydratedDocument<User>;
export type UserModelType = Model<UserDocument> & typeof User;