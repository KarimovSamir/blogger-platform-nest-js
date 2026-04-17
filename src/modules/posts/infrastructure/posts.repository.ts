import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../domain/post.entity';
import type { PostDocument, PostModelType } from '../domain/post.entity';

@Injectable()
export class PostsRepository {
    constructor(@InjectModel(Post.name) private postModel: PostModelType) {}

    async save(post: PostDocument): Promise<void> {
        await post.save();
    }

    async findById(id: string): Promise<PostDocument | null> {
        return this.postModel.findOne({ _id: id, deletedAt: null });
    }

    async findOrNotFoundFail(id: string): Promise<PostDocument> {
        const post = await this.findById(id);
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        return post;
    }
}
