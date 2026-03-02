import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Blog } from "../domain/blog.entity";
import type { BlogDocument, BlogModelType } from "../domain/blog.entity";

@Injectable() // Делает этот класс доступным для внедрения зависимостей (DI)
export class BlogsRepository {
    // Внедряем нашу Mongoose-модель. Теперь репозиторий может ходить в базу.
    constructor(@InjectModel(Blog.name) private blogModel: BlogModelType) { }

    // Получаем объект или null
    // Можно использовать если отсутствие blog - не проблема
    async findById(id: string): Promise<BlogDocument | null> {
        return this.blogModel.findOne({
            _id: id,
            deletedAt: null,
        });
    }

    // Получаем объект или ошибку
    // Можно не писать в логике проверки, если blog нет, то сразу ошибка
    async findOrNotFoundFail(id: string): Promise<BlogDocument> {
        const blog = await this.findById(id);
        if (!blog) {
            throw new NotFoundException('Blog not found');
        }
        return blog;
    }

    // Метод сохранения в Mongoose
    async save(blog: BlogDocument) {
        await blog.save();
    }
}