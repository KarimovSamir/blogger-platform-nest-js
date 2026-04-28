import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
    constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

    @Delete('all-data')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteAllData() {
        // CASCADE нужен из-за foreign keys: posts→blogs, comments→posts.
        // likes без FK, чистится явно.
        await this.dataSource.query(
            `TRUNCATE TABLE users, devices, blogs, posts, comments, likes CASCADE`,
        );
    }
}
