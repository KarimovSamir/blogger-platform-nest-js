import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UpdateUserDto } from '../../api/input-dto/update-user.input-dto';

export class UpdateUserCommand {
    constructor(
        public id: string,
        public dto: UpdateUserDto
    ) {}
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserUseCase implements ICommandHandler<UpdateUserCommand, void> {
    constructor(
        private usersRepository: UsersRepository,
    ) {}

    async execute(command: UpdateUserCommand): Promise<void> {
        const user = await this.usersRepository.findOrNotFoundFail(command.id);
        user.update(command.dto);
        await this.usersRepository.save(user);
    }
}