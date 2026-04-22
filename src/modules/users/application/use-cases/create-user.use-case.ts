import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { User } from '../../domain/user.entity';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CreateUserDto } from '../../dto/create-user.dto';
import { BcryptService } from '../../../../core/adapters/bcrypt.service';

export class CreateUserCommand {
    constructor(public dto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand, string> {
    constructor(
        // @InjectModel больше не нужен — User теперь просто класс, не Mongoose-модель
        private usersRepository: UsersRepository,
        private bcryptService: BcryptService,
    ) {}

    async execute(command: CreateUserCommand): Promise<string> {
        const passwordHash = await this.bcryptService.generateHash(command.dto.password);

        // Раньше: this.userModel.createInstance(...)
        // Теперь: User.createInstance(...) — вызываем статический метод напрямую
        const user = User.createInstance({
            login: command.dto.login,
            email: command.dto.email,
            passwordHash: passwordHash,
            isEmailConfirmed: true,
        });

        const savedUser = await this.usersRepository.save(user);

        // Раньше был user._id.toString() — MongoDB ObjectId
        // Теперь id возвращает PostgreSQL после INSERT через RETURNING *
        return savedUser.id;
    }
}