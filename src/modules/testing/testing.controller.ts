import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('testing')
export class TestingController {
    constructor(@InjectConnection() private readonly connection: Connection) {}

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
    }
}