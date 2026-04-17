import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';

// Команда - просто коробка с данными
export class DeletePostCommand {
    constructor(public id: string) {}
}

// Обработчик команды
@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<
    DeletePostCommand,
    void
> {
    constructor(private postsRepository: PostsRepository) {}

    async execute(command: DeletePostCommand): Promise<void> {
        const post = await this.postsRepository.findOrNotFoundFail(command.id);
        post.makeDeleted();
        await this.postsRepository.save(post);
    }
}
