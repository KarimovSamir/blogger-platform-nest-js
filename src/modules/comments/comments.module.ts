import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Comment, CommentSchema } from "./domain/comment.entity";
import { CommentsController } from "./api/comments.controller";
import { CommentsRepository } from "./infrastructure/comments.repository";
import { CommentsQueryRepository } from "./infrastructure/query/comments.query-repository";
import { CreateCommentUseCase } from "./application/use-cases/create-comments.use-case";
import { UpdateCommentLikeStatusUseCase } from "./application/use-cases/update-comment-like-status.use-case";
import { UpdateCommentUseCase } from "./application/use-cases/update-comments.use-case";
import { DeleteCommentUseCase } from "./application/use-cases/delete-comments.use-case";
import { LikesModule } from "../likes/likes.module";
import { CqrsModule } from "@nestjs/cqrs";
import { PostsModule } from "../posts/posts.module";

const useCases = [CreateCommentUseCase, UpdateCommentUseCase, DeleteCommentUseCase, UpdateCommentLikeStatusUseCase];

@Module({
    imports: [
        CqrsModule,
        MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
        forwardRef(() => PostsModule),
        LikesModule
    ],
    controllers: [CommentsController],
    providers: [
        CommentsRepository,
        CommentsQueryRepository,
        ...useCases
    ],
    exports: [CommentsQueryRepository],
})
export class CommentsModule { }
