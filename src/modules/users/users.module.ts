import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { User, UserSchema } from './domain/user.entity';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { UsersController } from './api/users.controller';
import { BcryptService } from '../../core/adapters/bcrypt.service';

import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';

const useCases = [CreateUserUseCase, UpdateUserUseCase, DeleteUserUseCase];

@Module({
    // Какие другие модули нужны этому модулю (users) для работы
    imports: [
        CqrsModule,
        // Динамически создаем мини-модуль, который регистрирует нашу схему в базе
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    // Кто принимает HTTP-запросы
    controllers: [UsersController],
    // Кто выполняет логику (сервисы, репозитории).
    providers: [
        UsersRepository, 
        UsersQueryRepository, 
        BcryptService,
        ...useCases
    ],
    exports: [UsersRepository, MongooseModule]
})
export class UsersModule { }
