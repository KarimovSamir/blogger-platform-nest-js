import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { PostQueryDto } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class PostsQueryRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async getByIdOrNotFoundFail(id: string, userId?: string): Promise<PostViewDto> {
        const result = await this.dataSource.query(
            `SELECT * FROM posts WHERE id = $1 AND "deletedAt" IS NULL`,
            [id],
        );

        if (!result[0]) {
            throw new NotFoundException('Post not found');
        }

        // По заданию домашки лайки игнорируем — myStatus всегда 'None', newestLikes всегда []
        return PostViewDto.mapToView(result[0], 'None', []);
    }

    async getAll(
        query: PostQueryDto, userId?: string
    ): Promise<PaginatedViewDto<PostViewDto[]>> {
        return this.runPaginatedQuery(query, ['"deletedAt" IS NULL'], []);
    }

    async getAllByBlogId(
        blogId: string,
        query: PostQueryDto,
        userId?: string,
    ): Promise<PaginatedViewDto<PostViewDto[]>> {
        // Фильтруем по blogId плюс не отдаём удалённые посты
        return this.runPaginatedQuery(query, ['"blogId" = $1', '"deletedAt" IS NULL'], [blogId]);
    }

    // Общая логика пагинации, чтобы не дублировать в getAll и getAllByBlogId
    private async runPaginatedQuery(
        query: PostQueryDto,
        baseConditions: string[],
        baseParams: any[],
    ): Promise<PaginatedViewDto<PostViewDto[]>> {
        const params: any[] = [...baseParams];
        const whereClause = baseConditions.join(' AND ');

        // Белый список колонок для сортировки — защита от SQL-инъекций через sortBy
        const allowedSortFields: Record<string, string> = {
            title: 'title',
            shortDescription: '"shortDescription"',
            content: 'content',
            blogId: '"blogId"',
            blogName: '"blogName"',
            createdAt: '"createdAt"',
        };
        const sortColumn = allowedSortFields[query.sortBy as string] ?? '"createdAt"';
        const sortDir = query.sortDirection === 'asc' ? 'ASC' : 'DESC';

        // Добавляем LIMIT и OFFSET в конец массива параметров
        params.push(query.pageSize);
        const limitIndex = params.length;

        params.push(query.calculateSkip());
        const offsetIndex = params.length;

        const posts = await this.dataSource.query(
            `SELECT * FROM posts
             WHERE ${whereClause}
             ORDER BY ${sortColumn} ${sortDir}
             LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
            params,
        );

        // Для totalCount используем те же условия, но без LIMIT/OFFSET
        const countResult = await this.dataSource.query(
            `SELECT COUNT(*)::int AS count FROM posts WHERE ${whereClause}`,
            params.slice(0, params.length - 2),
        );
        const totalCount = countResult[0].count;

        // По заданию лайки игнорируем — везде myStatus='None', newestLikes=[]
        const items = posts.map((post: any) => PostViewDto.mapToView(post, 'None', []));

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize,
        });
    }
}
