import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { Comment } from '../../domain/comment.entity';

export class CreateCommentCommand {
    constructor(
        public content: string,
        public userId: string,
        public userLogin: string,
        public postId: string,
    ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand, string> {
    constructor(private commentsRepository: CommentsRepository) {}

    async execute(command: CreateCommentCommand): Promise<string> {
        const { content, userId, userLogin, postId } = command;
        const comment = Comment.createInstance(content, { userId, userLogin }, postId);
        // save() возвращает Comment с проставленным сгенерированным UUID
        const saved = await this.commentsRepository.save(comment);
        return saved.id;
    }
}
