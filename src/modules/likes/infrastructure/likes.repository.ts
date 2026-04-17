import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    Like,
    type LikeDocument,
    type LikeModelType,
} from '../domain/like.entity';
import { LikeStatus } from '../api/input-dto/like.input-dto';

@Injectable()
export class LikesRepository {
    constructor(@InjectModel(Like.name) private likeModel: LikeModelType) { }

    // поиск ставил ли этот юзер уже лайк/дизлайк этой сущности
    async findByUserAndParentId(
        userId: string,
        parentId: string,
    ): Promise<LikeDocument | null> {
        return this.likeModel.findOne({ userId, parentId });
    }

    async findNewestLikesByParentId(parentId: string, limit: number): Promise<LikeDocument[]> {
        return this.likeModel
            .find({ parentId, status: LikeStatus.Like })
            .sort({ createdAt: -1 })
            .limit(limit);
    }

    async save(like: LikeDocument): Promise<void> {
        await like.save();
    }

    async create(parentId: string, userId: string, login: string, status: LikeStatus): Promise<void> {
        const newLike = new this.likeModel({ parentId, userId, login, status });
        await newLike.save();
    }
}
