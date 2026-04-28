import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Like } from '../domain/like.entity';
import { LikeStatus } from '../api/input-dto/like.input-dto';
import { mapRowToLike } from './mappers/like.mapper';

@Injectable()
export class LikesRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    // Поиск: ставил ли уже этот юзер лайк/дизлайк родителю (пост или коммент)
    async findByUserAndParentId(
        userId: string,
        parentId: string,
    ): Promise<Like | null> {
        const result = await this.dataSource.query(
            `SELECT * FROM likes WHERE "userId" = $1 AND "parentId" = $2`,
            [userId, parentId],
        );
        return result[0] ? mapRowToLike(result[0]) : null;
    }

    // Последние N лайков (только status='Like') — нужно для newestLikes у постов
    async findNewestLikesByParentId(
        parentId: string,
        limit: number,
    ): Promise<Like[]> {
        const rows = await this.dataSource.query(
            `SELECT * FROM likes
             WHERE "parentId" = $1 AND status = $2
             ORDER BY "createdAt" DESC
             LIMIT $3`,
            [parentId, LikeStatus.Like, limit],
        );
        return rows.map(mapRowToLike);
    }

    // INSERT для новой записи (id ещё не выставлен), UPDATE — для существующей
    async save(like: Like): Promise<Like> {
        if (!like.id) {
            const result = await this.dataSource.query(
                `INSERT INTO likes ("parentId", "userId", login, status)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [like.parentId, like.userId, like.login, like.status],
            );
            return mapRowToLike(result[0]);
        } else {
            const result = await this.dataSource.query(
                `UPDATE likes SET
                    status = $1,
                    "updatedAt" = NOW()
                 WHERE id = $2
                 RETURNING *`,
                [like.status, like.id],
            );
            // TypeORM для UPDATE возвращает [rows[], count]
            const row = Array.isArray(result[0]) ? result[0][0] : result[0];
            return mapRowToLike(row);
        }
    }

    // Обёртка для use-case'ов: создаёт доменный объект и сохраняет
    async create(
        parentId: string,
        userId: string,
        login: string,
        status: LikeStatus,
    ): Promise<Like> {
        const like = Like.createInstance(parentId, userId, login, status);
        return this.save(like);
    }
}
