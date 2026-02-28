import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../domain/user.entity';
import type { UserModelType } from '../../domain/user.entity';
import { UserViewDto } from '../../api/view-dto/user.view-dto';
import { UserQueryDto } from '../../dto/user-query.dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';


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
            throw new NotFoundException('User not found!');
        }

        return UserViewDto.mapToView(user);
    }

    // Новый метод для получения списка
    async getAll(
        query: UserQueryDto,
    ): Promise<PaginatedViewDto<UserViewDto[]>> {
        const filter: Record<string, any> = {
            deletedAt: null,
        };

        if (query.searchLoginTerm) {
            filter.$or = filter.$or || [];
            filter.$or.push({
                login: { $regex: query.searchLoginTerm, $options: 'i' },
            });
        }

        if (query.searchEmailTerm) {
            filter.$or = filter.$or || [];
            filter.$or.push({
                email: { $regex: query.searchEmailTerm, $options: 'i' },
            });
        }

        const users = await this.UserModel.find(filter)
            .sort({ [query.sortBy as string]: query.sortDirection })
            .skip(query.calculateSkip())
            .limit(query.pageSize);

        const totalCount = await this.UserModel.countDocuments(filter);

        const items = users.map(UserViewDto.mapToView);

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize,
        });
    }
}