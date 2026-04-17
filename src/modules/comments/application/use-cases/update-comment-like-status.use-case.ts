import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { LikesRepository } from '../../../likes/infrastructure/likes.repository';
import { LikeStatus, LikeInputDto } from '../../../likes/api/input-dto/like.input-dto';
import { Like } from '../../../likes/domain/like.entity';

export class UpdateCommentLikeStatusCommand {
    constructor(
        public commentId: string,
        public userId: string,
        public login: string,
        public dto: LikeInputDto
    ) {}
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusUseCase implements ICommandHandler<UpdateCommentLikeStatusCommand, void> {
    constructor(
        private commentsRepository: CommentsRepository,
        private likesRepository: LikesRepository,
    ) {}

    async execute(command: UpdateCommentLikeStatusCommand): Promise<void> {
        const { commentId, userId, login, dto } = command;
        const comment = await this.commentsRepository.findOrNotFoundFail(commentId);
        const existingLike = await this.likesRepository.findByUserAndParentId(userId, commentId);
        const currentStatus = existingLike ? existingLike.status : LikeStatus.None;
        const newStatus = dto.likeStatus;

        if (currentStatus === newStatus) return;

        // Чекаем и получаем текущие счетчики
        let { likesCount, dislikesCount } = comment.likesInfo;

        // Минусуем старый статус
        if (currentStatus === LikeStatus.Like) likesCount--;
        if (currentStatus === LikeStatus.Dislike) dislikesCount--;

        // Плюсуем новый статус
        if (newStatus === LikeStatus.Like) likesCount++;
        if (newStatus === LikeStatus.Dislike) dislikesCount++;

        // Защита от отрицательных значений
        likesCount = Math.max(0, likesCount);
        dislikesCount = Math.max(0, dislikesCount);

        comment.updateLikesCount(likesCount, dislikesCount);
        await this.commentsRepository.save(comment);

        if (existingLike) {
            existingLike.updateStatus(newStatus);
            await this.likesRepository.save(existingLike);
        } else {
            await this.likesRepository.create(commentId, userId, login, newStatus);
        }
    }
}