import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../domain/user.entity';
import type { UserDocument, UserModelType } from '../domain/user.entity'; // Явно указываем 'import type'

@Injectable() // Делает этот класс доступным для внедрения зависимостей (DI)
export class UsersRepository {
    // Внедряем нашу Mongoose-модель. Теперь репозиторий может ходить в базу.
    constructor(@InjectModel(User.name) private UserModel: UserModelType) { }

    // Получаем объект или null
    // Можно использовать если отсутствие юзера - не проблема
    async findById(id: string): Promise<UserDocument | null> {
        return this.UserModel.findOne({
            _id: id,
            deletedAt: null,
        });
    }

    // Получаем объект или ошибку
    // Можно не писать в логике проверки, если юзера нет, то сразу ошибка
    async findOrNotFoundFail(id: string): Promise<UserDocument> {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    // Метод сохранения в Mongoose
    async save(user: UserDocument) {
        await user.save();
    }

}