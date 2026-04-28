import { forwardRef, Module } from '@nestjs/common';
import { BlogsController } from './api/blogs.controller';
import { BlogsRepository } from './infrastructure/blogs.repository';
import { BlogsQueryRepository } from './infrastructure/query/blogs.query-repository';
import { PostsModule } from '../posts/posts.module';
import { CreateBlogUseCase } from './application/use-cases/create-blog.use-case';
import { UpdateBlogUseCase } from './application/use-cases/update-blog.use-case';
import { DeleteBlogUseCase } from './application/use-cases/delete-blog.use-case';

const useCases = [CreateBlogUseCase, UpdateBlogUseCase, DeleteBlogUseCase];

@Module({
    // Какие другие модули нужны этому модулю (blogs) для работы
    imports: [
        // Из этого модуля можно экспортировать то, что указано в
        forwardRef(() => PostsModule),
    ],
    // Кто принимает HTTP-запросы
    controllers: [BlogsController],
    // Кто выполняет логику (сервисы, репозитории).
    providers: [BlogsRepository, BlogsQueryRepository, ...useCases],
    exports: [BlogsRepository],
})
export class BlogsModule {}
