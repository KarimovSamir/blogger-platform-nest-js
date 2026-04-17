import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Comment } from "../../domain/comment.entity";
import type { CommentModelType } from "../../domain/comment.entity";
import { CommentViewDto } from "../../api/view-dto/comment.view-dto";
import { CommentQueryDto } from "../../api/input-dto/get-comments-query-params.input-dto";
import { PaginatedViewDto } from "../../../../core/dto/base.paginated.view-dto";
import { LikesRepository } from '../../../likes/infrastructure/likes.repository';

@Injectable()
export class CommentsQueryRepository {
    constructor(
        @InjectModel(Comment.name) private commentModel: CommentModelType,
        private likesRepository: LikesRepository,
    ) { }

    async getByIdOrNotFoundFail(id: string, userId?: string): Promise<CommentViewDto> {
        const comment = await this.commentModel.findOne({
            _id: id,
            deletedAt: null,
        });

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        let myStatus = 'None';
        if (userId) {
            const like = await this.likesRepository.findByUserAndParentId(userId, id);
            if (like) myStatus = like.status;
        }

        return CommentViewDto.mapToView(comment, myStatus);
    }

    async getAllByPostId(
        postId: string,
        query: CommentQueryDto,
        userId?: string
    ): Promise<PaginatedViewDto<CommentViewDto[]>> {
        const filter = {
            postId,
            deletedAt: null,
        };

        const comments = await this.commentModel
            .find(filter)
            .sort({ [query.sortBy]: query.sortDirection })
            .skip(query.calculateSkip())
            .limit(query.pageSize);

        const totalCount = await this.commentModel.countDocuments(filter);

        const items = await Promise.all(
            comments.map(async (comment) => {
                let myStatus = 'None';
                if (userId) {
                    const like = await this.likesRepository.findByUserAndParentId(userId, comment._id.toString());
                    if (like) myStatus = like.status;
                }
                return CommentViewDto.mapToView(comment, myStatus);
            })
        );

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize,
        });
    }
}
