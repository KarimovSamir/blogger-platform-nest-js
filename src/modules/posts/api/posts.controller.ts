import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
    Request
} from '@nestjs/common';
import { PostsQueryRepository } from '../infrastructure/query/posts.query-repository';
import { CreatePostInputDto } from './input-dto/create-post.input-dto';
import { UpdatePostInputDto } from './input-dto/update-post.input-dto';
import { PostQueryDto } from './input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from './view-dto/post.view-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { CommentsQueryRepository } from '../../comments/infrastructure/query/comments.query-repository';
import { CommentQueryDto } from '../../comments/api/input-dto/get-comments-query-params.input-dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/use-cases/create-post.use-case';
import { DeletePostCommand } from '../application/use-cases/delete-post.use-case';
import { UpdatePostCommand } from '../application/use-cases/update-post.use-case';
import { UpdatePostLikeStatusCommand } from '../application/use-cases/update-post-like-status.use-case';
import { JwtAuthGuard } from '../../auth/guards/jwt/jwt-auth.guard';
import { LikeInputDto } from '../../likes/api/input-dto/like.input-dto';

@Controller('posts')
export class PostsController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly postsQueryRepository: PostsQueryRepository,
        private readonly commentsQueryRepository: CommentsQueryRepository,
    ) { }

    @Get()
    async getAll(
        @Query() query: PostQueryDto,
    ): Promise<PaginatedViewDto<PostViewDto[]>> {
        return this.postsQueryRepository.getAll(query);
    }

    @Get(':id')
    async getById(@Param('id') id: string): Promise<PostViewDto> {
        return this.postsQueryRepository.getByIdOrNotFoundFail(id);
    }

    @Get(':postId/comments')
    async getCommentsForPost(
        @Param('postId') postId: string,
        @Query() query: CommentQueryDto,
    ) {
        await this.postsQueryRepository.getByIdOrNotFoundFail(postId);
        return this.commentsQueryRepository.getAllByPostId(postId, query);
    }

    @Post()
    async create(@Body() dto: CreatePostInputDto): Promise<PostViewDto> {
        const postId = await this.commandBus.execute(
            new CreatePostCommand(dto),
        );
        return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
    }

    @Put(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async update(@Param('id') id: string, @Body() dto: UpdatePostInputDto) {
        await this.commandBus.execute(new UpdatePostCommand(id, dto));
    }

    @UseGuards(JwtAuthGuard)
    @Put(':postId/like-status')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateLikeStatus(
        @Param('postId') postId: string,
        @Body() dto: LikeInputDto,
        @Request() req: any,
    ) {
        const userId = req.user.userId;
        const login = req.user.login;

        await this.commandBus.execute(
            new UpdatePostLikeStatusCommand(postId, userId, login, dto),
        );
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') id: string) {
        await this.commandBus.execute(new DeletePostCommand(id));
    }
}
