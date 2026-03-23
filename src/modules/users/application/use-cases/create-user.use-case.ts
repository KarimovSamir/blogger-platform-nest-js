import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { User, type UserModelType } from '../../domain/user.entity';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CreateUserDto } from '../../dto/create-user.dto';
import { BcryptService } from '../../../../core/adapters/bcrypt.service';

export class CreateUserCommand {
    constructor(public dto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand, string> {
    constructor(
        @InjectModel(User.name) private userModel: UserModelType,
        private usersRepository: UsersRepository,
        private bcryptService: BcryptService,
    ) {}

    async execute(command: CreateUserCommand): Promise<string> {
        const passwordHash = await this.bcryptService.generateHash(command.dto.password);

        const user = this.userModel.createInstance({
            login: command.dto.login,
            email: command.dto.email,
            passwordHash: passwordHash,
            isEmailConfirmed: true
        });
        
        await this.usersRepository.save(user);
        return user._id.toString();
    }
}