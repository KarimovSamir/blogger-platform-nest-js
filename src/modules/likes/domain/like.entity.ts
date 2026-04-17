import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { LikeStatus } from '../api/input-dto/like.input-dto';

@Schema({ timestamps: true })
export class Like {
    @Prop({ type: String, required: true })
    parentId: string;

    @Prop({ type: String, required: true })
    userId: string;

    @Prop({ type: String, required: true })
    login: string;

    @Prop({ type: String, enum: LikeStatus, required: true })
    status: LikeStatus;

    createdAt: Date;
    updatedAt: Date;

    static createInstance(
        parentId: string,
        userId: string,
        login: string,
        status: LikeStatus,
    ): LikeDocument {
        const like = new this();
        like.parentId = parentId;
        like.userId = userId;
        like.login = login;
        like.status = status;
        return like as LikeDocument;
    }

    updateStatus(newStatus: LikeStatus) {
        this.status = newStatus;
    }
}

export const LikeSchema = SchemaFactory.createForClass(Like);
LikeSchema.loadClass(Like);

export type LikeDocument = HydratedDocument<Like>;
export type LikeModelType = Model<LikeDocument> & typeof Like;
