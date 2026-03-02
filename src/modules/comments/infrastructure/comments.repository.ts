import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Comment } from "../domain/comment.entity";
import type { CommentDocument, CommentModelType } from "../domain/comment.entity";

@Injectable()
export class CommentsRepository {
    constructor(@InjectModel(Comment.name) private commentModel: CommentModelType) {}

    async findById(id: string): Promise<CommentDocument | null> {
        return this.commentModel.findOne({
            _id: id,
            deletedAt: null,
        });
    }

    async findOrNotFoundFail(id: string): Promise<CommentDocument> {
        const comment = await this.findById(id);
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }
        return comment;
    }

    async save(comment: CommentDocument): Promise<void> {
        await comment.save();
    }
}
