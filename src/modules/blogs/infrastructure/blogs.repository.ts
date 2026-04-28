import { Injectable, NotFoundException } from '@nestjs/common';
import { Blog } from '../domain/blog.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { mapRowToBlog } from './mappers/blog.mapper';

@Injectable() // Делает этот класс доступным для внедрения зависимостей (DI)
export class BlogsRepository {
    // Внедряем нашу Mongoose-модель. Теперь репозиторий может ходить в базу.
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    // Получаем объект или null
    // Можно использовать если отсутствие blog - не проблема
    async findById(id: string): Promise<Blog | null> {
        const result = await this.dataSource.query(
            `SELECT * FROM blogs WHERE id = $1 AND "deletedAt" IS NULL`,
            [id],
        );
        // query всегда возвращает массив, берём первый элемент или null
        return result[0] ? mapRowToBlog(result[0]) : null;
    }

    // Получаем объект или ошибку
    // Можно не писать в логике проверки, если blog нет, то сразу ошибка
    async findOrNotFoundFail(id: string): Promise<Blog> {
        const blog = await this.findById(id);
        if (!blog) {
            throw new NotFoundException('Blog not found');
        }
        return blog;
    }

    // В Mongoose был метод save() на документе — он сам понимал INSERT или UPDATE.
    // В raw SQL нужно явно разделить создание и обновление.
    async save(blog: Blog) {
        if (!blog.id) {
            // INSERT — если id нет, значит сессия новая
            const result = await this.dataSource.query(
                `INSERT INTO blogs (
                    name, 
                    description, 
                    "websiteUrl"
                ) VALUES ($1, $2, $3)
                RETURNING *`,
                [blog.name, blog.description, blog.websiteUrl],
            );
            return mapRowToBlog(result[0]);
        } else {
            // UPDATE — если id есть, значит сессия уже в БД (refresh-token)
            const result = await this.dataSource.query(
                `UPDATE blogs SET
                    name = $1,
                    description = $2,
                    "websiteUrl" = $3,
                    "deletedAt" = $4,
                    "updatedAt" = NOW()
                WHERE id = $5
                RETURNING *`,
                [blog.name, blog.description, blog.websiteUrl, blog.deletedAt, blog.id],
            );
            return mapRowToBlog(result[0]);
        }
    }
}
