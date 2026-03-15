import { Controller, Get, Post, Body, Param, Delete, Query, HttpCode, HttpStatus, Put, UseGuards } from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from './input-dto/update-user.input-dto';
import { UserQueryDto } from './input-dto/get-users-query-params.input-dto';
import { UserViewDto } from './view-dto/user.view-dto';
import { PaginatedViewDto } from "../../../core/dto/base.paginated.view-dto";
import { BasicAuthGuard } from '../../auth/guards/basic/basic-auth.guard';

// @Query() вытаскивает данные после ? (например, ?page=1)
// @Body() вытаскивает тело POST-запроса (req.body)
// @Param() вытаскивает часть пути URL (например, :id из /users/123)

// вешаем на все эндпоинты в этом контроллере
@UseGuards(BasicAuthGuard) 
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        // Внедряем Query-репозиторий для GET-запросов и формирования ответов
        private readonly usersQueryRepository: UsersQueryRepository,
    ) { }

    // @Query() — это указатель для NestJS, откуда брать данные во время работы программы
    // То есть «Возьми req.query из HTTP-запроса и положи его в эту переменную»
    @Get()
    async findAll(@Query() query: UserQueryDto): Promise<PaginatedViewDto<UserViewDto[]>>  {
        return this.usersQueryRepository.getAll(query);
    }

    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        // Создаём сущность через сервис и получаем айди
        const userId = await this.usersService.create(createUserDto);
        // А затем берём готовый ViewDto через репозиторий
        return this.usersQueryRepository.getByIdOrNotFoundFail(userId);
    }

    @Put(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateUser(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        await this.usersService.updateUser(id, updateUserDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.usersService.deleteUser(id)
    }
}
