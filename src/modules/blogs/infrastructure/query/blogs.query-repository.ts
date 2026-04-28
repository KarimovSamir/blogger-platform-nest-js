import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogViewDto } from '../../api/view-dto/blog.view-dto';
import { BlogQueryDto } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class BlogsQueryRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    // Метод ищет blog и сразу возвращает отформатированный ViewDto
    async getByIdOrNotFoundFail(id: string): Promise<BlogViewDto> {
        const result = await this.dataSource.query(
            `SELECT * FROM blogs WHERE id = $1 AND "deletedAt" IS NULL`,
            [id],
        );

        if (!result[0]) {
            throw new NotFoundException('Blog not found!');
        }

        return BlogViewDto.mapToView(result[0]);
    }

    // Метод для получения списка с пагинацией, поиском и сортировкой
    async getAll(query: BlogQueryDto): Promise<PaginatedViewDto<BlogViewDto[]>> {
        // Собираем условия фильтрации динамически.
        // В Mongoose это был объект filter с $regex, здесь — массив WHERE-условий и параметров.
        const conditions: string[] = ['"deletedAt" IS NULL'];
        const params: any[] = [];

        if (query.searchNameTerm) {
            params.push(`%${query.searchNameTerm}%`);
            // ILIKE — это PostgreSQL-аналог { $regex: ..., $options: 'i' } (регистронезависимый поиск)
            conditions.push(`name ILIKE $${params.length}`);
        }

        const whereClause = conditions.join(' AND ');

        // Белый список колонок для сортировки — защита от SQL-инъекций через sortBy
        const allowedSortFields: Record<string, string> = {
            name: 'name',
            description: 'description',
            websiteUrl: '"websiteUrl"',
            isMembership: '"isMembership"',
            createdAt: '"createdAt"',
        };
        const sortColumn = allowedSortFields[query.sortBy as string] ?? '"createdAt"';
        const sortDir = query.sortDirection === 'asc' ? 'ASC' : 'DESC';

        // Добавляем LIMIT и OFFSET в конец массива параметров
        params.push(query.pageSize);
        const limitIndex = params.length;

        params.push(query.calculateSkip());
        const offsetIndex = params.length;

        const blogs = await this.dataSource.query(
            `SELECT * FROM blogs
             WHERE ${whereClause}
             ORDER BY ${sortColumn} ${sortDir}
             LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
            params,
        );

        // Для totalCount используем те же условия, но без LIMIT/OFFSET
        const countResult = await this.dataSource.query(
            `SELECT COUNT(*)::int AS count FROM blogs WHERE ${whereClause}`,
            params.slice(0, params.length - 2),
        );
        const totalCount = countResult[0].count;

        const items = blogs.map(BlogViewDto.mapToView);

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize,
        });
    }
}
