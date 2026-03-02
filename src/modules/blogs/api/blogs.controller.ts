import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from "@nestjs/common";
import { BlogsService } from "../application/blogs.service";
import { BlogsQueryRepository } from "../infrastructure/query/blogs.query-repository";
import { BlogQueryDto } from "./input-dto/get-blogs-query-params.input-dto";
import { CreateBlogDto } from "./input-dto/create-blog.input-dto";
import { UpdateBlogDto } from "./input-dto/update-blog.input-dto";
import { BlogViewDto } from "./view-dto/blog.view-dto";
import { PaginatedViewDto } from "../../../core/dto/base.paginated.view-dto";
import { PostsQueryRepository } from "../../posts/infrastructure/query/posts.query-repository";
import { PostsService } from "../../posts/application/posts.service";
import { PostQueryDto } from "../../posts/api/input-dto/get-posts-query-params.input-dto";
import { CreatePostForBlogDto } from "./input-dto/create-posts-for-blog.input-dto";


// @Query() вытаскивает данные после ? (например, ?page=1)
// @Body() вытаскивает тело POST-запроса (req.body)
// @Param() вытаскивает часть пути URL (например, :id из /blogs/123)

@Controller('blogs')
export class BlogsController {
    constructor(
        private readonly blogsService: BlogsService,
        // Внедряем Query-репозиторий для GET-запросов и формирования ответов
        private readonly blogsQueryRepository: BlogsQueryRepository,
        private readonly postsService: PostsService,
        private readonly postsQueryRepository: PostsQueryRepository,
    ) { }

    // @Query() — это указатель для NestJS, откуда брать данные во время работы программы
    // То есть «Возьми req.query из HTTP-запроса и положи его в эту переменную»
    @Get()
    async findAll(@Query() query: BlogQueryDto): Promise<PaginatedViewDto<BlogViewDto[]>> {
        return this.blogsQueryRepository.getAll(query);
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.blogsQueryRepository.getByIdOrNotFoundFail(id);
    }

    @Get(':blogId/posts')
    async getPostsForBlog(
        @Param('blogId') blogId: string, 
        @Query() query: PostQueryDto
    ) {
        await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
        return this.postsQueryRepository.getAllByBlogId(blogId, query);
    }

    @Post(':blogId/posts')
    async createPostForBlog(
        @Param('blogId') blogId: string, 
        @Body() createPostDto: CreatePostForBlogDto
    ) {
        const createdPostId = await this.postsService.createForBlog(blogId, createPostDto);
        return this.postsQueryRepository.getByIdOrNotFoundFail(createdPostId);
    }

    @Post()
    async create(@Body() createBlogDto: CreateBlogDto) {
        // Создаём сущность через сервис и получаем айди
        const blogId = await this.blogsService.create(createBlogDto);
        // А затем берём готовый ViewDto через репозиторий
        return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
    }

    @Put(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async update(
        @Param('id') id: string,
        @Body() updateBlogDto: UpdateBlogDto,
    ) {
        await this.blogsService.update(id, updateBlogDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.blogsService.delete(id)
    }
}