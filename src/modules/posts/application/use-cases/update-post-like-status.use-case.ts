import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { LikesRepository } from '../../../likes/infrastructure/likes.repository';
import {
    LikeStatus,
    LikeInputDto,
} from '../../../likes/api/input-dto/like.input-dto';
import { Like } from '../../../likes/domain/like.entity';

export class UpdatePostLikeStatusCommand {
    constructor(
        public postId: string,
        public userId: string,
        public login: string, // Логин нужен для сохранения в Like
        public dto: LikeInputDto,
    ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase implements ICommandHandler<
    UpdatePostLikeStatusCommand,
    void
> {
    constructor(
        private postsRepository: PostsRepository,
        private likesRepository: LikesRepository,
    ) {}

    async execute(command: UpdatePostLikeStatusCommand): Promise<void> {
        const { postId, userId, login, dto } = command;
        const post = await this.postsRepository.findOrNotFoundFail(postId);
        const existingLike = await this.likesRepository.findByUserAndParentId(
            userId,
            postId,
        );
        const currentStatus = existingLike
            ? existingLike.status
            : LikeStatus.None;
        const newStatus = dto.likeStatus;

        if (currentStatus === newStatus) return;

        // Считаем/пересчитываем счётчик
        let { likesCount, dislikesCount } = post.likesInfo;

        if (currentStatus === LikeStatus.Like) likesCount--;
        if (currentStatus === LikeStatus.Dislike) dislikesCount--;

        if (newStatus === LikeStatus.Like) likesCount++;
        if (newStatus === LikeStatus.Dislike) dislikesCount++;

        // Защита от отрицательных значений
        likesCount = Math.max(0, likesCount);
        dislikesCount = Math.max(0, dislikesCount);

        post.updateLikesCount(likesCount, dislikesCount);
        await this.postsRepository.save(post);

        // Обновляем/создаем лайк
        if (existingLike) {
            existingLike.updateStatus(newStatus);
            await this.likesRepository.save(existingLike);
        } else {
            const newLike = Like.createInstance(
                postId,
                userId,
                login,
                newStatus,
            );
            await this.likesRepository.save(newLike);
        }
    }
}
