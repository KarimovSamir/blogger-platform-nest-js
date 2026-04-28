import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { PostQueryDto } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { LikesRepository } from '../../../likes/infrastructure/likes.repository';

@Injectable()
export class PostsQueryRepository {
    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private likesRepository: LikesRepository,
    ) {}

    async getByIdOrNotFoundFail(id: string, userId?: string): Promise<PostViewDto> {
        const result = await this.dataSource.query(
            `SELECT * FROM posts WHERE id = $1 AND "deletedAt" IS NULL`,
            [id],
        );

        if (!result[0]) {
            throw new NotFoundException('Post not found');
        }

        const myStatus = await this.resolveMyStatus(id, userId);
        const newestLikes = await this.resolveNewestLikes(id);
        return PostViewDto.mapToView(result[0], myStatus, newestLikes);
    }

    async getAll(
        query: PostQueryDto,
        userId?: string,
    ): Promise<PaginatedViewDto<PostViewDto[]>> {
        return this.runPaginatedQuery(query, ['"deletedAt" IS NULL'], [], userId);
    }

    async getAllByBlogId(
        blogId: string,
        query: PostQueryDto,
        userId?: string,
    ): Promise<PaginatedViewDto<PostViewDto[]>> {
        return this.runPaginatedQuery(
            query,
            ['"blogId" = $1', '"deletedAt" IS NULL'],
            [blogId],
            userId,
        );
    }

    private async runPaginatedQuery(
        query: PostQueryDto,
        baseConditions: string[],
        baseParams: any[],
        userId?: string,
    ): Promise<PaginatedViewDto<PostViewDto[]>> {
        const params: any[] = [...baseParams];
        const whereClause = baseConditions.join(' AND ');

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

        const countResult = await this.dataSource.query(
            `SELECT COUNT(*)::int AS count FROM posts WHERE ${whereClause}`,
            params.slice(0, params.length - 2),
        );
        const totalCount = countResult[0].count;

        const items = await Promise.all(
            posts.map(async (post: any) => {
                const myStatus = await this.resolveMyStatus(post.id, userId);
                const newestLikes = await this.resolveNewestLikes(post.id);
                return PostViewDto.mapToView(post, myStatus, newestLikes);
            }),
        );

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize,
        });
    }

    private async resolveMyStatus(postId: string, userId?: string): Promise<string> {
        if (!userId) return 'None';
        const like = await this.likesRepository.findByUserAndParentId(userId, postId);
        return like ? like.status : 'None';
    }

    private async resolveNewestLikes(
        postId: string,
    ): Promise<Array<{ addedAt: string; userId: string; login: string }>> {
        const likes = await this.likesRepository.findNewestLikesByParentId(postId, 3);
        return likes.map((like) => ({
            addedAt: like.createdAt,
            userId: like.userId,
            login: like.login,
        }));
    }
}
