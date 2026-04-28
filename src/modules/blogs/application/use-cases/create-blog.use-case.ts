import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Blog } from '../../domain/blog.entity';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { CreateBlogDto } from '../../api/input-dto/create-blog.input-dto';

// Команда - просто коробка с данными
export class CreateBlogCommand {
    constructor(public dto: CreateBlogDto) {}
}

// Обработчик команды
@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<
    CreateBlogCommand,
    string
> {
    constructor(
        private blogsRepository: BlogsRepository,
    ) {}

    async execute(command: CreateBlogCommand): Promise<string> {
        const blog = Blog.createInstance(
            command.dto.name,
            command.dto.description,
            command.dto.websiteUrl,
        );
        const savedBlog = await this.blogsRepository.save(blog);
        return savedBlog.id;
    }
}
