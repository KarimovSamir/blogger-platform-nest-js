import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Post } from "../../domain/post.entity";
import type { PostModelType } from "../../domain/post.entity";
import { PostViewDto } from "../../api/view-dto/post.view-dto";
import { PostQueryDto } from "../../api/input-dto/get-posts-query-params.input-dto";
import { PaginatedViewDto } from "../../../../core/dto/base.paginated.view-dto";

@Injectable()
export class PostsQueryRepository {
    constructor(@InjectModel(Post.name) private postModel: PostModelType) { }

    async getByIdOrNotFoundFail(id: string): Promise<PostViewDto> {
        const post = await this.postModel.findOne({
            _id: id,
            deletedAt: null,
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        return PostViewDto.mapToView(post);
    }

    async getAll(query: PostQueryDto): Promise<PaginatedViewDto<PostViewDto[]>> {
        const filter = { deletedAt: null };

        const posts = await this.postModel
            .find(filter)
            .sort({ [query.sortBy]: query.sortDirection })
            .skip(query.calculateSkip())
            .limit(query.pageSize);

        const totalCount = await this.postModel.countDocuments(filter);
        const items = posts.map(PostViewDto.mapToView);

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize,
        });
    }

    async getAllByBlogId(blogId: string, query: PostQueryDto): Promise<PaginatedViewDto<PostViewDto[]>> {
        // Добавляем deletedAt: null, чтобы не отдать удаленные посты
        const filter = { blogId: blogId, deletedAt: null };

        const posts = await this.postModel
            .find(filter)
            .sort({ [query.sortBy]: query.sortDirection })
            .skip(query.calculateSkip())
            .limit(query.pageSize);

        const totalCount = await this.postModel.countDocuments(filter);
        const items = posts.map(PostViewDto.mapToView);

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize,
        });
    }
}
