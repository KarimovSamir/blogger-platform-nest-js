import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";

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

    createdAt: Date;

    static createInstance(
        title: string,
        shortDescription: string,
        content: string,
        blogId: string,
        blogName: string
    ): PostDocument {
        const post = new this();
        post.title = title;
        post.shortDescription = shortDescription;
        post.content = content;
        post.blogId = blogId;
        post.blogName = blogName;
        return post as PostDocument;
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
