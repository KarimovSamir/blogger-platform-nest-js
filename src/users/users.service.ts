import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';

@Injectable()
export class UsersService {
    create(createUserDto: CreateUserDto) {
        return 'This action adds a new user';
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
