import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommentInputDto } from '../../api/input-dto/comment.input-dto';

export class UpdateCommentCommand {
    constructor(
        public commentId: string,
        public userId: string,
        public dto: CommentInputDto
    ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand, void> {
    constructor(
        private commentsRepository: CommentsRepository,
    ) {}

    async execute(command: UpdateCommentCommand): Promise<void> {
        const comment = await this.commentsRepository.findOrNotFoundFail(command.commentId);

        if (comment.commentatorInfo.userId !== command.userId) {
            throw new ForbiddenException('You can update only your own comments');
        }

        comment.update(command.dto.content);
        await this.commentsRepository.save(comment);
    }
}