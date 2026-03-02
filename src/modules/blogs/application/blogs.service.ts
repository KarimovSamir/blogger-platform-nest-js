import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Blog } from "../domain/blog.entity";
import type { BlogModelType } from "../domain/blog.entity";
import { BlogsRepository } from "../infrastructure/blogs.repository";
import { CreateBlogDto } from "../api/input-dto/create-blog.input-dto";
import { UpdateBlogDto } from "../api/input-dto/update-blog.input-dto";

@Injectable()
export class BlogsService {
    constructor(
        @InjectModel(Blog.name) private blogModel: BlogModelType,
        private blogsRepository: BlogsRepository,
    ) { }

    async create(createBlogDto: CreateBlogDto){
        const blog = this.blogModel.createInstance(
            createBlogDto.name,
            createBlogDto.description,
            createBlogDto.websiteUrl,
        );
        await this.blogsRepository.save(blog);
        return blog._id.toString();
    }

    async update(id: string, dto: UpdateBlogDto): Promise<void> {
        const blog = await this.blogsRepository.findOrNotFoundFail(id);
        blog.update(dto);
        await this.blogsRepository.save(blog);
    }

    async delete(id: string) {
        const blog = await this.blogsRepository.findOrNotFoundFail(id);
        blog.makeDeleted()
        await this.blogsRepository.save(blog);
    }
}