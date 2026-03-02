import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from "@nestjs/common";
import { PostsService } from "../application/posts.service";
import { PostsQueryRepository } from "../infrastructure/query/posts.query-repository";
import { CreatePostInputDto } from "./input-dto/create-post.input-dto";
import { UpdatePostInputDto } from "./input-dto/update-post.input-dto";
import { PostQueryDto } from "./input-dto/get-posts-query-params.input-dto";
import { PostViewDto } from "./view-dto/post.view-dto";
import { PaginatedViewDto } from "../../../core/dto/base.paginated.view-dto";
import { CommentsQueryRepository } from "../../comments/infrastructure/query/comments.query-repository";
import { CommentQueryDto } from "../../comments/api/input-dto/get-comments-query-params.input-dto";

@Controller('posts')
export class PostsController {
    constructor(
        private postsService: PostsService,
        private postsQueryRepository: PostsQueryRepository,
        private readonly commentsQueryRepository: CommentsQueryRepository,
    ) {}

    @Get()
    async getAll(@Query() query: PostQueryDto): Promise<PaginatedViewDto<PostViewDto[]>> {
        return this.postsQueryRepository.getAll(query);
    }

    @Get(':id')
    async getById(@Param('id') id: string): Promise<PostViewDto> {
        return this.postsQueryRepository.getByIdOrNotFoundFail(id);
    }

    @Get(':postId/comments')
    async getCommentsForPost(
        @Param('postId') postId: string,
        @Query() query: CommentQueryDto
    ) {
        await this.postsQueryRepository.getByIdOrNotFoundFail(postId);
        return this.commentsQueryRepository.getAllByPostId(postId, query);
    }

    @Post()
    async create(@Body() dto: CreatePostInputDto): Promise<PostViewDto> {
        const postId = await this.postsService.create(dto);
        return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
    }

    @Put(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async update(@Param('id') id: string, @Body() dto: UpdatePostInputDto): Promise<void> {
        await this.postsService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') id: string): Promise<void> {
        await this.postsService.delete(id);
    }
}
