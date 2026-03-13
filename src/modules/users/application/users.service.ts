import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../domain/user.entity';
import type { UserModelType } from '../domain/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';
import { BcryptService } from '../../../core/adapters/bcrypt.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: UserModelType,
        private usersRepository: UsersRepository,
        private bcryptService: BcryptService
    ) { }

    async create(dto: CreateUserDto) {
        const passwordHash = await this.bcryptService.generateHash(
            dto.password,
        );

        const user = this.userModel.createInstance({
            login: dto.login,
            email: dto.email,
            passwordHash: passwordHash,
            isEmailConfirmed: true
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
}
