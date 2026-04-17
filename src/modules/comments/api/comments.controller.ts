import { Controller, Get, Put, Delete, Param, Body, HttpCode, HttpStatus, UseGuards, Request } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { CommentsQueryRepository } from "../infrastructure/query/comments.query-repository";
import { CommentViewDto } from "./view-dto/comment.view-dto";
import { JwtAuthGuard } from "../../auth/guards/jwt/jwt-auth.guard";
import { UpdateCommentCommand } from "../application/use-cases/update-comments.use-case";
import { DeleteCommentCommand } from "../application/use-cases/delete-comments.use-case";
import { CommentInputDto } from "./input-dto/comment.input-dto";
import { LikeInputDto } from "../../likes/api/input-dto/like.input-dto";
import { UpdateCommentLikeStatusCommand } from "../application/use-cases/update-comment-like-status.use-case";
import { JwtOptionalAuthGuard } from '../../auth/guards/jwt/jwt-optional-auth.guard';


@Controller('comments')
export class CommentsController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly commentsQueryRepository: CommentsQueryRepository,
    ) {}

    @UseGuards(JwtOptionalAuthGuard)
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
        const userId = req.user.userId;
        
        await this.commandBus.execute(new UpdateCommentCommand(commentId, userId, dto));
    }

    @UseGuards(JwtAuthGuard)
    @Put(':commentId/like-status')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateLikeStatus(
        @Param('commentId') commentId: string,
        @Body() dto: LikeInputDto,
        @Request() req: any
    ) {
        const userId = req.user.userId;
        const login = req.user.login;
        await this.commandBus.execute(new UpdateCommentLikeStatusCommand(commentId, userId, login, dto));
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