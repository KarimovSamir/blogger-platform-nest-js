import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";

@Schema({ _id: false })
export class CommentatorInfo {
    @Prop({ type: String, required: true })
    userId: string;

    @Prop({ type: String, required: true })
    userLogin: string;
}

@Schema({ _id: false })
export class LikesInfo {
    @Prop({ type: Number, default: 0 })
    likesCount: number;

    @Prop({ type: Number, default: 0 })
    dislikesCount: number;
}

@Schema({ timestamps: true })
export class Comment {
    @Prop({ type: String, required: true })
    content: string;

    @Prop({ type: CommentatorInfo, required: true })
    commentatorInfo: CommentatorInfo;

    @Prop({ type: String, required: true })
    postId: string;

    @Prop({ type: LikesInfo, default: () => ({ likesCount: 0, dislikesCount: 0 }) })
    likesInfo: LikesInfo;

    @Prop({ type: Date, default: null })
    deletedAt: Date | null;

    createdAt: Date;

    static createInstance(
        content: string,
        commentatorInfo: { userId: string, userLogin: string },
        postId: string
    ): CommentDocument {
        const comment = new this();
        comment.content = content;
        comment.commentatorInfo = commentatorInfo;
        comment.postId = postId;
        comment.likesInfo = { likesCount: 0, dislikesCount: 0 };
        comment.deletedAt = null;
        return comment as CommentDocument;
    }

    update(content: string) {
        this.content = content;
    }

    makeDeleted() {
        if (this.deletedAt !== null) {
            throw new Error('Entity already deleted');
        }
        this.deletedAt = new Date();
    }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;
export type CommentModelType = Model<CommentDocument> & typeof Comment;
