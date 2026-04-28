import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
    constructor(
        @InjectConnection() private readonly connection: Connection,
        @InjectDataSource() private readonly dataSource: DataSource,
    ) {}

    @Delete('all-data')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteAllData() {
        // Получаем объект со всеми коллекциями, которые сейчас есть в Mongoose
        const collections = this.connection.collections;

        // Проходимся по каждой коллекции и удаляем из неё все документы
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }

        // Очищаем PostgreSQL таблицы
        // TRUNCATE быстрее чем DELETE, и CASCADE чтобы учесть foreign keys если появятся
        // CASCADE нужен из-за foreign key между posts и blogs
        await this.dataSource.query(`TRUNCATE TABLE users, devices, posts, blogs, likes CASCADE`);

    }
}