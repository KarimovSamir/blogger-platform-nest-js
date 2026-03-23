import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from '../../infrastructure/comments.repository';

export class DeleteCommentCommand {
    constructor(
        public commentId: string,
        public userId: string
    ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand, void> {
    constructor(
        private commentsRepository: CommentsRepository,
    ) {}

    async execute(command: DeleteCommentCommand): Promise<void> {
        const comment = await this.commentsRepository.findOrNotFoundFail(command.commentId);

        if (comment.commentatorInfo.userId !== command.userId) {
            throw new ForbiddenException('You can delete only your own comments');
        }

        comment.makeDeleted();
        await this.commentsRepository.save(comment);
    }
}