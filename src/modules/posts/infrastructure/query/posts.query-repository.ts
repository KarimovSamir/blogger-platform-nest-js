import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../../domain/post.entity';
import type { PostModelType } from '../../domain/post.entity';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { PostQueryDto } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { LikesRepository } from '../../../likes/infrastructure/likes.repository';

@Injectable()
export class PostsQueryRepository {
    constructor(
        @InjectModel(Post.name) private postModel: PostModelType,
        private likesRepository: LikesRepository,
    ) { }

    async getByIdOrNotFoundFail(id: string, userId?: string): Promise<PostViewDto> {
        const post = await this.postModel.findOne({
            _id: id,
            deletedAt: null,
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        const { myStatus, newestLikes } = await this.buildLikeData(id, userId);

        return PostViewDto.mapToView(post, myStatus, newestLikes);
    }

    async getAll(
        query: PostQueryDto, userId?: string
    ): Promise<PaginatedViewDto<PostViewDto[]>> {
        const filter = { deletedAt: null };

        const posts = await this.postModel
            .find(filter)
            .sort({ [query.sortBy]: query.sortDirection })
            .skip(query.calculateSkip())
            .limit(query.pageSize);

        const totalCount = await this.postModel.countDocuments(filter);
        const items = await Promise.all(
            posts.map(async (post) => {
                const { myStatus, newestLikes } = await this.buildLikeData(post._id.toString(), userId);
                return PostViewDto.mapToView(post, myStatus, newestLikes);
            })
        );

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize,
        });
    }

    async getAllByBlogId(
        blogId: string,
        query: PostQueryDto,
    ): Promise<PaginatedViewDto<PostViewDto[]>> {
        // Добавляем deletedAt: null, чтобы не отдать удаленные посты
        const filter = { blogId: blogId, deletedAt: null };

        const posts = await this.postModel
            .find(filter)
            .sort({ [query.sortBy]: query.sortDirection })
            .skip(query.calculateSkip())
            .limit(query.pageSize);

        const totalCount = await this.postModel.countDocuments(filter);
        const items = posts.map((post) => PostViewDto.mapToView(post));

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize,
        });
    }

    private async buildLikeData(postId: string, userId?: string) {
        const newest = await this.likesRepository.findNewestLikesByParentId(postId, 3);
        const newestLikes = newest.map(l => ({
            addedAt: l.createdAt.toISOString(),
            userId: l.userId,
            login: l.login,
        }));

        let myStatus = 'None';
        if (userId) {
            const userLike = await this.likesRepository.findByUserAndParentId(userId, postId);
            if (userLike) myStatus = userLike.status;
        }
        return { myStatus, newestLikes };
    }

}
