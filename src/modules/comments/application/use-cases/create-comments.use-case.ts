import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { CommentsRepository } from "../../infrastructure/comments.repository";
import { Comment } from "../../domain/comment.entity";
import type { CommentModelType } from "../../domain/comment.entity";

// 1. Упаковываем аргументы в класс-команду
export class CreateCommentCommand {
    constructor(
        public content: string,
        public userId: string,
        public userLogin: string,
        public postId: string,
    ) {}
}

// 2. Указываем, какую команду обрабатывает этот класс
@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand, string> {
    
    // 3. Инжектим только те зависимости, которые нужны для создания
    constructor(
        private commentsRepository: CommentsRepository,
        @InjectModel(Comment.name) private commentModel: CommentModelType,
    ) {}

    // 4. Метод execute, внутри которого старая логика
    async execute(command: CreateCommentCommand): Promise<string> {
        // Достаем данные из команды для удобства
        const { content, userId, userLogin, postId } = command;
        const comment = this.commentModel.createInstance(content, { userId, userLogin }, postId); 
        await this.commentsRepository.save(comment);
        return comment._id.toString();
    }
}