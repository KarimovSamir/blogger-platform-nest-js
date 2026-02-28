import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './domain/user.entity';
import type { UserModelType } from './domain/user.entity';
import { UsersRepository } from './infrastructure/users.repository';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private UserModel: UserModelType,
        private usersRepository: UsersRepository,
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

    findAll(userQueryDto: UserQueryDto) {
        return {
            pagesCount: 1,
            page: userQueryDto.pageNumber,
            pageSize: userQueryDto.pageSize,
            totalCount: 0,
            items: []
        };
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
