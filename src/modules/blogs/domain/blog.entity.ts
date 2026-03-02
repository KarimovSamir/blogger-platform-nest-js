import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";

@Schema({timestamps: true})
export class Blog {
    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String, required: true })
    description: string;

    @Prop({ type: String, required: true })
    websiteUrl: string;

    @Prop({ type: Date, nullable: true, default: null })
    deletedAt: Date | null;
    
    @Prop({ type: Boolean, required: false, default: false })
    isMembership: boolean;
    
    createdAt: Date;

    static createInstance(name: string, description: string, websiteUrl: string) : BlogDocument {
        const blog = new this();
        blog.name = name;
        blog.description = description;
        blog.websiteUrl = websiteUrl;
        return blog as BlogDocument;
    }

    update(dto: {name: string, description: string, websiteUrl: string}) {
        this.name = dto.name;
        this.description = dto.description;
        this.websiteUrl = dto.websiteUrl;
    }

    makeDeleted() {
        if (this.deletedAt !== null) {
            throw new Error ('Entity already deleted');
        }
        this.deletedAt = new Date();
    }
}

export const BlogSсhema = SchemaFactory.createForClass(Blog);
BlogSсhema.loadClass(Blog);

export type BlogDocument = HydratedDocument<Blog>
export type BlogModelType = Model<BlogDocument> & typeof Blog