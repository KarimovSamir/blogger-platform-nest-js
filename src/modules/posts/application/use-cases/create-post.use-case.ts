import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Post, type PostModelType } from '../../domain/post.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { CreatePostInputDto } from '../../api/input-dto/create-post.input-dto';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

// Команда - просто коробка с данными
export class CreatePostCommand {
    constructor(public dto: CreatePostInputDto) {}
}

// Обработчик команды
@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand, string> {
    constructor(
        @InjectModel(Post.name) private postModel: PostModelType,
        private postsRepository: PostsRepository,
        private blogsRepository: BlogsRepository,
    ) {}

    async execute(command: CreatePostCommand): Promise<string> {
        const blog = await this.blogsRepository.findOrNotFoundFail(command.dto.blogId);
        const post = this.postModel.createInstance(
            command.dto.title,
            command.dto.shortDescription,
            command.dto.content,
            command.dto.blogId,
            blog.name,
        );
        await this.postsRepository.save(post);
        return post._id.toString();
    }
}