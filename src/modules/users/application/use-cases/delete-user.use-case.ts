import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';

export class DeleteUserCommand {
    constructor(public id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand, void> {
    constructor(
        private usersRepository: UsersRepository,
    ) {}

    async execute(command: DeleteUserCommand): Promise<void> {
        const user = await this.usersRepository.findOrNotFoundFail(command.id);
        user.makeDeleted();
        await this.usersRepository.save(user);
    }
}