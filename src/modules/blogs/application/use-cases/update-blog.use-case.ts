import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { UpdateBlogDto } from '../../api/input-dto/update-blog.input-dto';

export class UpdateBlogCommand {
    constructor(
        public id: string,
        public dto: UpdateBlogDto,
    ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<
    UpdateBlogCommand,
    void
> {
    constructor(private blogsRepository: BlogsRepository) {}

    async execute(command: UpdateBlogCommand): Promise<void> {
        // Достаем из коробки нужные данные
        const { id, dto } = command;
        const blog = await this.blogsRepository.findOrNotFoundFail(id);
        blog.update(dto);
        await this.blogsRepository.save(blog);
    }
}
