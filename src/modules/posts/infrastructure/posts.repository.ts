import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Post } from '../domain/post.entity';
import { mapRowToPost } from './mappers/post.mapper';

@Injectable()
export class PostsRepository {
    // Внедряем DataSource — соединение с PostgreSQL
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async findById(id: string): Promise<Post | null> {
        const result = await this.dataSource.query(
            `SELECT * FROM posts WHERE id = $1 AND "deletedAt" IS NULL`,
            [id],
        );
        // query всегда возвращает массив, берём первый элемент или null
        return result[0] ? mapRowToPost(result[0]) : null;
    }

    async findOrNotFoundFail(id: string): Promise<Post> {
        const post = await this.findById(id);
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        return post;
    }

    // В Mongoose был метод save() на документе — он сам понимал INSERT или UPDATE.
    // В raw SQL нужно явно разделить создание и обновление.
    async save(post: Post): Promise<Post> {
        if (!post.id) {
            // INSERT — если id нет, значит пост новый
            const result = await this.dataSource.query(
                `INSERT INTO posts (
                    title,
                    "shortDescription",
                    content,
                    "blogId",
                    "blogName"
                ) VALUES ($1, $2, $3, $4, $5)
                RETURNING *`,
                [
                    post.title,
                    post.shortDescription,
                    post.content,
                    post.blogId,
                    post.blogName,
                ],
            );
            return mapRowToPost(result[0]);
        } else {
            // UPDATE — если id есть, значит пост уже в БД
            const result = await this.dataSource.query(
                `UPDATE posts SET
                    title = $1,
                    "shortDescription" = $2,
                    content = $3,
                    "blogId" = $4,
                    "likesCount" = $5,
                    "dislikesCount" = $6,
                    "deletedAt" = $7,
                    "updatedAt" = NOW()
                WHERE id = $8
                RETURNING *`,
                [
                    post.title,
                    post.shortDescription,
                    post.content,
                    post.blogId,
                    post.likesInfo.likesCount,
                    post.likesInfo.dislikesCount,
                    post.deletedAt,
                    post.id,
                ],
            );
            return mapRowToPost(result[0]);
        }
    }
}
