import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Post } from '../../domain/post.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { CreatePostForBlogDto } from '../../../blogs/api/input-dto/create-posts-for-blog.input-dto';

// Команда - просто коробка с данными
export class CreatePostForBlogCommand {
    constructor(
        public blogId: string,
        public dto: CreatePostForBlogDto,
    ) {}
}

// Обработчик команды
@CommandHandler(CreatePostForBlogCommand)
export class CreatePostForBlogUseCase implements ICommandHandler<
    CreatePostForBlogCommand,
    string
> {
    constructor(
        private postsRepository: PostsRepository,
        private blogsRepository: BlogsRepository,
    ) {}

    async execute(command: CreatePostForBlogCommand): Promise<string> {
        const { blogId, dto } = command;
        const blog = await this.blogsRepository.findOrNotFoundFail(blogId);
        const post = Post.createInstance(
            dto.title,
            dto.shortDescription,
            dto.content,
            blogId,
            blog.name,
        );
        const savedPost = await this.postsRepository.save(post);
        return savedPost.id;
    }
}
