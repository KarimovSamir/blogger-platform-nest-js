import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/users.query-repository';

@Module({
    // Какие другие модули нужны этому модулю (users) для работы
    imports: [
        // Динамически создаем мини-модуль, который регистрирует нашу схему в базе
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    // Кто принимает HTTP-запросы
    controllers: [UsersController],
    // Кто выполняет логику (сервисы, репозитории).
    providers: [UsersService, UsersRepository, UsersQueryRepository],
})
export class UsersModule { }
