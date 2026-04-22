import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserViewDto } from '../../api/view-dto/user.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { UserQueryDto } from '../../api/input-dto/get-users-query-params.input-dto';

@Injectable()
export class UsersQueryRepository {
    // Внедряем DataSource — это наше соединение с PostgreSQL (аналог userModel в Mongoose)
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    // Метод ищет юзера и сразу возвращает отформатированный ViewDto
    async getByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
        const result = await this.dataSource.query(
            `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`,
            [id],
        );
        if (!result[0]) {
            throw new NotFoundException('User not found!');
        }
        return UserViewDto.mapToView(result[0]);
    }

    async getAll(query: UserQueryDto): Promise<PaginatedViewDto<UserViewDto[]>> {
        // Собираем условия фильтрации динамически.
        // В Mongoose это был объект filter с $or, здесь — массив WHERE-условий и параметров.
        const conditions: string[] = ['deleted_at IS NULL'];
        const params: any[] = [];

        if (query.searchLoginTerm) {
            params.push(`%${query.searchLoginTerm}%`);
            conditions.push(`login ILIKE $${params.length}`);
            // ILIKE — это PostgreSQL-аналог { $regex: ..., $options: 'i' } (регистронезависимый поиск)
        }

        if (query.searchEmailTerm) {
            params.push(`%${query.searchEmailTerm}%`);
            conditions.push(`email ILIKE $${params.length}`);
        }

        // Если оба условия поиска заданы — они должны работать через OR, как в Mongoose
        const whereClause =
            query.searchLoginTerm && query.searchEmailTerm
                ? `deleted_at IS NULL AND (login ILIKE $1 OR email ILIKE $2)`
                : conditions.join(' AND ');

        // Белый список колонок для сортировки — защита от SQL-инъекций через sortBy
        const allowedSortFields: Record<string, string> = {
            login: 'login',
            email: 'email',
            createdAt: 'created_at',
        };
        const sortColumn = allowedSortFields[query.sortBy as string] ?? 'created_at';
        const sortDir = query.sortDirection === 'asc' ? 'ASC' : 'DESC';

        // Добавляем LIMIT и OFFSET в конец массива параметров
        params.push(query.pageSize);
        const limitIndex = params.length;

        params.push(query.calculateSkip());
        const offsetIndex = params.length;

        const users = await this.dataSource.query(
            `SELECT * FROM users
             WHERE ${whereClause}
             ORDER BY ${sortColumn} ${sortDir}
             LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
            params,
        );

        // Для totalCount используем те же условия, но без LIMIT/OFFSET
        const countResult = await this.dataSource.query(
            `SELECT COUNT(*)::int AS count FROM users WHERE ${whereClause}`,
            // Передаём только search-параметры, без limit и offset
            params.slice(0, params.length - 2),
        );
        const totalCount = countResult[0].count;

        const items = users.map(UserViewDto.mapToView);

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize,
        });
    }
}