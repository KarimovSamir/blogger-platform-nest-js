import { Module } from '@nestjs/common';
import { UsersService } from './application/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { UsersController } from './api/users.controller';
import { BcryptService } from '../../core/adapters/bcrypt.service';

@Module({
    // Какие другие модули нужны этому модулю (users) для работы
    imports: [
        // Динамически создаем мини-модуль, который регистрирует нашу схему в базе
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    // Кто принимает HTTP-запросы
    controllers: [UsersController],
    // Кто выполняет логику (сервисы, репозитории).
    providers: [UsersService, UsersRepository, UsersQueryRepository, BcryptService],
    exports: [UsersRepository, MongooseModule]
})
export class UsersModule { }
