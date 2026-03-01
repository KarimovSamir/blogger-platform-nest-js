import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './domain/user.entity';
import type { UserModelType } from './domain/user.entity';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private UserModel: UserModelType,
        private usersRepository: UsersRepository,
        private usersQueryRepository: UsersQueryRepository,
    ) { }

    async create(createUserDto: CreateUserDto) {
        const user = this.UserModel.createInstance(
            createUserDto.login,
            createUserDto.email,
            createUserDto.password,
        );
        await this.usersRepository.save(user);
        return user._id.toString();
    }

    async deleteUser(id: string) {
        const user = await this.usersRepository.findOrNotFoundFail(id);
        user.makeDeleted()
        await this.usersRepository.save(user);
    }

    async findAll(userQueryDto: UserQueryDto) {
        return await this.usersQueryRepository.getAll(userQueryDto)
    }

    findOne(id: number) {
        return `This action returns a #${id} user`;
    }

    update(id: number, updateUserDto: UpdateUserDto) {
        return `This action updates a #${id} user`;
    }

    remove(id: string) {
        return `This action removes a #${id} user`;
    }
}
