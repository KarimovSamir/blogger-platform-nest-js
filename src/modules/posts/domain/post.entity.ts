import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ _id: false })
class PostLikesInfo {
    @Prop({ type: Number, default: 0 })
    likesCount: number;

    @Prop({ type: Number, default: 0 })
    dislikesCount: number;
}

@Schema({ timestamps: true })
export class Post {
    @Prop({ type: String, required: true })
    title: string;

    @Prop({ type: String, required: true })
    shortDescription: string;

    @Prop({ type: String, required: true })
    content: string;

    @Prop({ type: String, required: true })
    blogId: string;

    @Prop({ type: String, required: true })
    blogName: string;

    @Prop({ type: Date, nullable: true, default: null })
    deletedAt: Date | null;

    // хранение счетчиков лайков в базу
    @Prop({ type: PostLikesInfo, default: () => ({ likesCount: 0, dislikesCount: 0 }) })
    likesInfo: PostLikesInfo;

    createdAt: Date;

    static createInstance(
        title: string,
        shortDescription: string,
        content: string,
        blogId: string,
        blogName: string,
    ): PostDocument {
        const post = new this();
        post.title = title;
        post.shortDescription = shortDescription;
        post.content = content;
        post.blogId = blogId;
        post.blogName = blogName;
        post.likesInfo = { likesCount: 0, dislikesCount: 0 };
        return post as PostDocument;
    }

    // обновления счетчиков, вызывается из UseCase
    updateLikesCount(likesCount: number, dislikesCount: number) {
        this.likesInfo.likesCount = likesCount;
        this.likesInfo.dislikesCount = dislikesCount;
    }

    update(dto: {
        title: string;
        shortDescription: string;
        content: string;
        blogId: string;
    }) {
        this.title = dto.title;
        this.shortDescription = dto.shortDescription;
        this.content = dto.content;
        this.blogId = dto.blogId;
    }

    makeDeleted() {
        if (this.deletedAt !== null) {
            throw new Error('Entity already deleted');
        }
        this.deletedAt = new Date();
    }
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post);

export type PostDocument = HydratedDocument<Post>;
export type PostModelType = Model<PostDocument> & typeof Post;
