import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

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

    // TypeScript должен знать что такие поля существуют, хоть мы и указали timestamps
    createdAt: Date;
    updatedAt: Date;

    // Паттерн Фабрика (инкапсуляция логики создания)
    // Static потому что для вызова нам не нужен объект User.createInstance()
    static createInstance(login: string, email: string, passwordHash: string): UserDocument {
        const user = new this();
        user.login = login;
        user.email = email;
        user.passwordHash = passwordHash;
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
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User); // Регистрируем методы в Mongoose

export type UserDocument = HydratedDocument<User>;
export type UserModelType = Model<UserDocument> & typeof User;