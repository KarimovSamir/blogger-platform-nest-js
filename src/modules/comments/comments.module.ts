import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Comment, CommentSchema } from "./domain/comment.entity";
import { CommentsController } from "./api/comments.controller";
import { CommentsService } from "./application/comments.service";
import { CommentsRepository } from "./infrastructure/comments.repository";
import { CommentsQueryRepository } from "./infrastructure/query/comments.query-repository";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    ],
    controllers: [CommentsController],
    providers: [
        CommentsService,
        CommentsRepository,
        CommentsQueryRepository,
    ],
    exports: [CommentsQueryRepository],
})
export class CommentsModule {}
