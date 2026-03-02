import { Injectable } from "@nestjs/common";
import { CreatePostInputDto } from "../api/input-dto/create-post.input-dto";
import { UpdatePostInputDto } from "../api/input-dto/update-post.input-dto";
import { Post } from "../domain/post.entity";
import type { PostModelType } from "../domain/post.entity";
import { PostsRepository } from "../infrastructure/posts.repository";
import { BlogsRepository } from "../../blogs/infrastructure/blogs.repository";
import { InjectModel } from "@nestjs/mongoose";
import { CreatePostForBlogDto } from "../../blogs/api/input-dto/create-posts-for-blog.input-dto";

@Injectable()
export class PostsService {
    constructor(
        @InjectModel(Post.name) private postModel: PostModelType,
        private postsRepository: PostsRepository,
        private blogsRepository: BlogsRepository,
    ) {}

    async create(dto: CreatePostInputDto): Promise<string> {
        const blog = await this.blogsRepository.findOrNotFoundFail(dto.blogId);
        const post = this.postModel.createInstance(
            dto.title,
            dto.shortDescription,
            dto.content,
            dto.blogId,
            blog.name,
        );
        await this.postsRepository.save(post);
        return post._id.toString();
    }

    async createForBlog(blogId: string, dto: CreatePostForBlogDto): Promise<string> {
        const blog = await this.blogsRepository.findOrNotFoundFail(blogId);
        const post = this.postModel.createInstance(
            dto.title,
            dto.shortDescription,
            dto.content,
            blogId,
            blog.name,
        );
        await this.postsRepository.save(post);
        return post._id.toString();
    }

    async update(id: string, dto: UpdatePostInputDto): Promise<void> {
        const post = await this.postsRepository.findOrNotFoundFail(id);
        post.update(dto);
        await this.postsRepository.save(post);
    }

    async delete(id: string): Promise<void> {
        const post = await this.postsRepository.findOrNotFoundFail(id);
        post.makeDeleted();
        await this.postsRepository.save(post);
    }
}
