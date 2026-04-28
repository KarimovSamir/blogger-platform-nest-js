import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { CommentQueryDto } from '../../api/input-dto/get-comments-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { LikesRepository } from '../../../likes/infrastructure/likes.repository';

@Injectable()
export class CommentsQueryRepository {
    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private likesRepository: LikesRepository,
    ) {}

    async getByIdOrNotFoundFail(id: string, userId?: string): Promise<CommentViewDto> {
        const result = await this.dataSource.query(
            `SELECT * FROM comments WHERE id = $1 AND "deletedAt" IS NULL`,
            [id],
        );

        if (!result[0]) {
            throw new NotFoundException('Comment not found');
        }

        const myStatus = await this.resolveMyStatus(id, userId);
        return CommentViewDto.mapToView(result[0], myStatus);
    }

    async getAllByPostId(
        postId: string,
        query: CommentQueryDto,
        userId?: string,
    ): Promise<PaginatedViewDto<CommentViewDto[]>> {
        // Белый список — защита от SQL-инъекций через sortBy
        const allowedSortFields: Record<string, string> = {
            content: 'content',
            createdAt: '"createdAt"',
        };
        const sortColumn = allowedSortFields[query.sortBy as string] ?? '"createdAt"';
        const sortDir = query.sortDirection === 'asc' ? 'ASC' : 'DESC';

        const params: any[] = [postId, query.pageSize, query.calculateSkip()];

        const rows = await this.dataSource.query(
            `SELECT * FROM comments
             WHERE "postId" = $1 AND "deletedAt" IS NULL
             ORDER BY ${sortColumn} ${sortDir}
             LIMIT $2 OFFSET $3`,
            params,
        );

        const countResult = await this.dataSource.query(
            `SELECT COUNT(*)::int AS count FROM comments
             WHERE "postId" = $1 AND "deletedAt" IS NULL`,
            [postId],
        );
        const totalCount = countResult[0].count;

        const items = await Promise.all(
            rows.map(async (row: any) => {
                const myStatus = await this.resolveMyStatus(row.id, userId);
                return CommentViewDto.mapToView(row, myStatus);
            }),
        );

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize,
        });
    }

    private async resolveMyStatus(commentId: string, userId?: string): Promise<string> {
        if (!userId) return 'None';
        const like = await this.likesRepository.findByUserAndParentId(userId, commentId);
        return like ? like.status : 'None';
    }
}
