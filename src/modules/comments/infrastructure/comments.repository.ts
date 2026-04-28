import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Comment } from '../domain/comment.entity';
import { mapRowToComment } from './mappers/comment.mapper';

@Injectable()
export class CommentsRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async findById(id: string): Promise<Comment | null> {
        const result = await this.dataSource.query(
            `SELECT * FROM comments WHERE id = $1 AND "deletedAt" IS NULL`,
            [id],
        );
        return result[0] ? mapRowToComment(result[0]) : null;
    }

    async findOrNotFoundFail(id: string): Promise<Comment> {
        const comment = await this.findById(id);
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }
        return comment;
    }

    // Возвращает Comment с присвоенным id — нужно для create-use-case
    async save(comment: Comment): Promise<Comment> {
        if (!comment.id) {
            const result = await this.dataSource.query(
                `INSERT INTO comments (
                    content,
                    "postId",
                    "commentatorInfo_userId",
                    "commentatorInfo_userLogin"
                ) VALUES ($1, $2, $3, $4)
                RETURNING *`,
                [
                    comment.content,
                    comment.postId,
                    comment.commentatorInfo.userId,
                    comment.commentatorInfo.userLogin,
                ],
            );
            return mapRowToComment(result[0]);
        } else {
            const result = await this.dataSource.query(
                `UPDATE comments SET
                    content = $1,
                    "likesCount" = $2,
                    "dislikesCount" = $3,
                    "deletedAt" = $4,
                    "updatedAt" = NOW()
                WHERE id = $5
                RETURNING *`,
                [
                    comment.content,
                    comment.likesInfo.likesCount,
                    comment.likesInfo.dislikesCount,
                    comment.deletedAt,
                    comment.id,
                ],
            );
            // TypeORM для UPDATE возвращает [rows[], count]
            const row = Array.isArray(result[0]) ? result[0][0] : result[0];
            return mapRowToComment(row);
        }
    }
}
