import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    Like,
    type LikeDocument,
    type LikeModelType,
} from '../domain/like.entity';

@Injectable()
export class LikesRepository {
    constructor(@InjectModel(Like.name) private likeModel: LikeModelType) {}

    // поиск ставил ли этот юзер уже лайк/дизлайк этой сущности
    async findByUserAndParentId(
        userId: string,
        parentId: string,
    ): Promise<LikeDocument | null> {
        return this.likeModel.findOne({ userId, parentId });
    }

    async save(like: LikeDocument): Promise<void> {
        await like.save();
    }
}
