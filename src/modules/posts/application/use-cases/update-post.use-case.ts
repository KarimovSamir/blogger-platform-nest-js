import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { UpdatePostInputDto } from '../../api/input-dto/update-post.input-dto';

// Команда - просто коробка с данными
export class UpdatePostCommand {
    constructor(
        public id: string,
        public dto: UpdatePostInputDto
    ) {}
}

// Обработчик команды
@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand, void> {
    constructor(
        private postsRepository: PostsRepository,
    ) {}

    async execute(command: UpdatePostCommand): Promise<void> {
        const { id, dto } = command; 
        const post = await this.postsRepository.findOrNotFoundFail(id);
        post.update(dto);
        await this.postsRepository.save(post);
    }
}