import { Controller, Get, Param } from "@nestjs/common";
import { CommentsQueryRepository } from "../infrastructure/query/comments.query-repository";
import { CommentViewDto } from "./view-dto/comment.view-dto";
import { CommandBus } from "@nestjs/cqrs";

@Controller('comments')
export class CommentsController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly commentsQueryRepository: CommentsQueryRepository,
    ) {}

    @Get(':id')
    async getComment(
        @Param('id') id: string,
    ): Promise<CommentViewDto> {
        return this.commentsQueryRepository.getByIdOrNotFoundFail(id);
    }
}
