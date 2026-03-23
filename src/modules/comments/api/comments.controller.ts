import { Controller, Get, Put, Delete, Param, Body, HttpCode, HttpStatus, UseGuards, Request } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { CommentsQueryRepository } from "../infrastructure/query/comments.query-repository";
import { CommentViewDto } from "./view-dto/comment.view-dto";
import { JwtAuthGuard } from "../../auth/guards/jwt/jwt-auth.guard";
import { UpdateCommentCommand } from "../application/use-cases/update-comments.use-case";
import { DeleteCommentCommand } from "../application/use-cases/delete-comments.use-case";
import { CommentInputDto } from "./input-dto/comment.input-dto";



@Controller('comments')
export class CommentsController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly commentsQueryRepository: CommentsQueryRepository,
    ) {}

    // GET остается публичным (или опционально авторизованным, если нужны лайки, но пока так)
    @Get(':id')
    async getComment(@Param('id') id: string): Promise<CommentViewDto> {
        return this.commentsQueryRepository.getByIdOrNotFoundFail(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':commentId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateComment(
        @Param('commentId') commentId: string,
        @Body() dto: CommentInputDto,
        @Request() req: any
    ) {
        // Достаем ID юзера из payload токена
        const userId = req.user.userId; // Проверь, как именно у тебя называется поле в req.user
        
        await this.commandBus.execute(new UpdateCommentCommand(commentId, userId, dto));
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':commentId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteComment(
        @Param('commentId') commentId: string,
        @Request() req: any
    ) {
        const userId = req.user.userId;
        await this.commandBus.execute(new DeleteCommentCommand(commentId, userId));
    }
}