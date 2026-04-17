import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../../domain/blog.entity';
import type { BlogModelType } from '../../domain/blog.entity';
import { BlogViewDto } from '../../api/view-dto/blog.view-dto';
import { BlogQueryDto } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';

@Injectable() // Делаем класс доступным для внедрения в контроллер
export class BlogsQueryRepository {
    constructor(@InjectModel(Blog.name) private blogModel: BlogModelType) {}

    // Метод ищет blog и сразу возвращает отформатированный ViewDto
    async getByIdOrNotFoundFail(id: string): Promise<BlogViewDto> {
        const blog = await this.blogModel.findOne({
            _id: id,
            deletedAt: null, // Игнорируем удаленных
        });

        if (!blog) {
            throw new NotFoundException('Blog not found!');
        }

        return BlogViewDto.mapToView(blog);
    }

    // Новый метод для получения списка
    async getAll(
        query: BlogQueryDto,
    ): Promise<PaginatedViewDto<BlogViewDto[]>> {
        const filter: Record<string, any> = {
            deletedAt: null,
        };

        if (query.searchNameTerm) {
            filter.name = { $regex: query.searchNameTerm, $options: 'i' };
        }

        const blogs = await this.blogModel
            .find(filter)
            .sort({ [query.sortBy as string]: query.sortDirection })
            .skip(query.calculateSkip())
            .limit(query.pageSize);

        const totalCount = await this.blogModel.countDocuments(filter);

        // const items = blogs.map(BlogViewDto.mapToView);
        const items = blogs.map((blog) => BlogViewDto.mapToView(blog));

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize,
        });
    }
}
