import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../../domain/blog.entity';
import type { BlogModelType } from '../../domain/blog.entity';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { CreateBlogDto } from '../../api/input-dto/create-blog.input-dto';

// Команда - просто коробка с данными
export class CreateBlogCommand {
    constructor(public dto: CreateBlogDto) {}
}

// Обработчик команды
@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand, string> {
    constructor(
        @InjectModel(Blog.name) private blogModel: BlogModelType,
        private blogsRepository: BlogsRepository,
    ) {}

    async execute(command: CreateBlogCommand): Promise<string> {
        const blog = this.blogModel.createInstance(
            command.dto.name,
            command.dto.description,
            command.dto.websiteUrl,
        );
        await this.blogsRepository.save(blog);
        return blog._id.toString();
    }
}