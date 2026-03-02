import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Blog, BlogSсhema } from "./domain/blog.entity";
import { BlogsController } from "./api/blogs.controller";
import { BlogsService } from "./application/blogs.service";
import { BlogsRepository } from "./infrastructure/blogs.repository";
import { BlogsQueryRepository } from "./infrastructure/query/blogs.query-repository";

@Module({
    // Какие другие модули нужны этому модулю (blogs) для работы
    imports: [
        // Динамически создаем мини-модуль, который регистрирует нашу схему в базе
        MongooseModule.forFeature([{name: Blog.name, schema: BlogSсhema}])
    ],
    // Кто принимает HTTP-запросы
    controllers: [BlogsController],
    // Кто выполняет логику (сервисы, репозитории).
    providers: [BlogsService, BlogsRepository, BlogsQueryRepository]
})
export class BlogsModule { }