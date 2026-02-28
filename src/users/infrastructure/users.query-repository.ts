import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../domain/user.entity';
import type { UserModelType } from '../domain/user.entity';
import { UserViewDto } from '../api/view-dto/user.view-dto';

@Injectable() // Делаем класс доступным для внедрения в контроллер
export class UsersQueryRepository {
    constructor(
        @InjectModel(User.name) private UserModel: UserModelType,
    ) { }

    // Метод ищет юзера и сразу возвращает отформатированный ViewDto
    async getByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
        const user = await this.UserModel.findOne({
            _id: id,
            deletedAt: null, // Игнорируем удаленных
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return UserViewDto.mapToView(user);
    }
}