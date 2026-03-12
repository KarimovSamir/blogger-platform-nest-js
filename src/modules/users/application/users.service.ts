import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../domain/user.entity';
import type { UserModelType } from '../domain/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';
import { UpdateUserDto } from '../api/input-dto/update-user.input-dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: UserModelType,
        private usersRepository: UsersRepository,
    ) { }

    async create(createUserDto: CreateUserDto) {
        const user = this.userModel.createInstance({
            login: createUserDto.login,
            email: createUserDto.email,
            passwordHash: createUserDto.password,
        });
        await this.usersRepository.save(user);
        return user._id.toString();
    }

    async updateUser(id: string, dto: { email: string }): Promise<string> {
        const user = await this.usersRepository.findOrNotFoundFail(id);
        user.update(dto);
        await this.usersRepository.save(user);
        return user._id.toString();
    }

    async deleteUser(id: string) {
        const user = await this.usersRepository.findOrNotFoundFail(id);
        user.makeDeleted()
        await this.usersRepository.save(user);
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
