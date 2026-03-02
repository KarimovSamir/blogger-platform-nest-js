import { Injectable } from "@nestjs/common";
import { CommentsRepository } from "../infrastructure/comments.repository";
import { Comment } from "../domain/comment.entity";
import type { CommentModelType } from "../domain/comment.entity";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class CommentsService {
    constructor(
        private commentsRepository: CommentsRepository,
        @InjectModel(Comment.name) private commentModel: CommentModelType,
    ) {}

    async create(content: string, userId: string, userLogin: string, postId: string): Promise<string> {
        const comment = this.commentModel.createInstance(content, { userId, userLogin }, postId);
        await this.commentsRepository.save(comment);
        return comment._id.toString();
    }

    async update(id: string, content: string): Promise<void> {
        // Stub for future logic
    }

    async delete(id: string): Promise<void> {
        // Stub for future logic
    }
}
