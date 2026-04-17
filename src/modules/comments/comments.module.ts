import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Comment, CommentSchema } from "./domain/comment.entity";
import { CommentsController } from "./api/comments.controller";
import { CommentsRepository } from "./infrastructure/comments.repository";
import { CommentsQueryRepository } from "./infrastructure/query/comments.query-repository";
import { CreateCommentUseCase } from "./application/use-cases/create-comments.use-case";
import { UpdateBlogUseCase } from "../blogs/application/use-cases/update-blog.use-case";
import { DeleteBlogUseCase } from "../blogs/application/use-cases/delete-blog.use-case";
import { UpdateCommentLikeStatusUseCase } from "./application/use-cases/update-comment-like-status.use-case";

const useCases = [CreateCommentUseCase, UpdateBlogUseCase, DeleteBlogUseCase, UpdateCommentLikeStatusUseCase];

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    ],
    controllers: [CommentsController],
    providers: [
        CommentsRepository,
        CommentsQueryRepository,
        ...useCases
    ],
    exports: [CommentsQueryRepository],
})
export class CommentsModule {}
