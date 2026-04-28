import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { BlogsQueryRepository } from "../infrastructure/query/blogs.query-repository";
import { BlogQueryDto } from "./input-dto/get-blogs-query-params.input-dto";
import { CreateBlogDto } from "./input-dto/create-blog.input-dto";
import { UpdateBlogDto } from "./input-dto/update-blog.input-dto";
import { BlogViewDto } from "./view-dto/blog.view-dto";
import { PaginatedViewDto } from "../../../core/dto/base.paginated.view-dto";
import { PostsQueryRepository } from "../../posts/infrastructure/query/posts.query-repository";
import { PostQueryDto } from "../../posts/api/input-dto/get-posts-query-params.input-dto";
import { CreatePostForBlogDto } from "./input-dto/create-posts-for-blog.input-dto";
import { CommandBus } from "@nestjs/cqrs";
import { CreateBlogCommand } from "../application/use-cases/create-blog.use-case";
import { UpdateBlogCommand } from "../application/use-cases/update-blog.use-case";
import { DeleteBlogCommand } from "../application/use-cases/delete-blog.use-case";
import { CreatePostForBlogCommand } from "../../posts/application/use-cases/create-post-for-blog.use-case";
import { BasicAuthGuard } from "../../auth/guards/basic/basic-auth.guard";
import { UpdatePostInputDto } from "../../posts/api/input-dto/update-post.input-dto";
import { UpdatePostCommand } from "../../posts/application/use-cases/update-post.use-case";
import { DeletePostCommand } from "../../posts/application/use-cases/delete-post.use-case";

// @Query() вытаскивает данные после ? (например, ?page=1)
// @Body() вытаскивает тело POST-запроса (req.body)
// @Param() вытаскивает часть пути URL (например, :id из /blogs/123)

@Controller('sa/blogs')
export class BlogsSAController {
    constructor(
        private readonly commandBus: CommandBus,
        // Внедряем Query-репозиторий для GET-запросов и формирования ответов
        private readonly blogsQueryRepository: BlogsQueryRepository,
        private readonly postsQueryRepository: PostsQueryRepository,
    ) { }

    // @Query() — это указатель для NestJS, откуда брать данные во время работы программы
    // То есть «Возьми req.query из HTTP-запроса и положи его в эту переменную»
    @UseGuards(BasicAuthGuard)
    @Get()
    async findAll(@Query() query: BlogQueryDto): Promise<PaginatedViewDto<BlogViewDto[]>> {
        return this.blogsQueryRepository.getAll(query);
    }

    @UseGuards(BasicAuthGuard)
    @Get(':blogId/posts')
    async getPostsForBlog(
        @Param('blogId') blogId: string,
        @Query() query: PostQueryDto
    ) {
        await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
        return this.postsQueryRepository.getAllByBlogId(blogId, query);
    }

    @UseGuards(BasicAuthGuard)
    @Post(':blogId/posts')
    async createPostForBlog(
        @Param('blogId') blogId: string,
        @Body() createPostDto: CreatePostForBlogDto
    ) {
        const createdPostId = await this.commandBus.execute(new CreatePostForBlogCommand(blogId, createPostDto));
        return this.postsQueryRepository.getByIdOrNotFoundFail(createdPostId);
    }

    @UseGuards(BasicAuthGuard)
    @Post()
    async create(@Body() createBlogDto: CreateBlogDto) {
        // Создаём сущность через UseCase и получаем айди
        const blogId = await this.commandBus.execute(new CreateBlogCommand(createBlogDto));
        // А затем берём готовый ViewDto через репозиторий
        return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
    }

    @UseGuards(BasicAuthGuard)
    @Put(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async update(
        @Param('id') id: string,
        @Body() updateBlogDto: UpdateBlogDto,
    ) {
        await this.commandBus.execute(new UpdateBlogCommand(id, updateBlogDto));
    }

    @Put(':blogId/posts/:postId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updatePostForBlog(
        @Param('blogId') blogId: string,
        @Param('postId') postId: string,
        @Body() dto: CreatePostForBlogDto,
    ) {
        await this.commandBus.execute(new UpdatePostCommand(postId, { ...dto, blogId }));
    }


    @UseGuards(BasicAuthGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.commandBus.execute(new DeleteBlogCommand(id));
    }

    @UseGuards(BasicAuthGuard)
    @Delete(':blogId/posts/:postId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deletePostForBlog(
        @Param('blogId') blogId: string,
        @Param('postId') postId: string,
    ) {
        await this.commandBus.execute(new DeletePostCommand(postId));
    }
}