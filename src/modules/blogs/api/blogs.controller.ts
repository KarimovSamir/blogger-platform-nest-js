import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from "@nestjs/common";
import { BlogsService } from "../application/blogs.service";
import { BlogsQueryRepository } from "../infrastructure/query/blogs.query-repository";
import { BlogQueryDto } from "./input-dto/get-blogs-query-params.input-dto";
import { CreateBlogDto } from "./input-dto/create-blog.input-dto";
import { UpdateBlogDto } from "./input-dto/update-blog.input-dto";

// @Query() вытаскивает данные после ? (например, ?page=1)
// @Body() вытаскивает тело POST-запроса (req.body)
// @Param() вытаскивает часть пути URL (например, :id из /blogs/123)

@Controller('blogs')
export class BlogsController {
    constructor(
        private readonly blogsService: BlogsService,
        // Внедряем Query-репозиторий для GET-запросов и формирования ответов
        private readonly blogsQueryRepository: BlogsQueryRepository,
    ) { }

    // @Query() — это указатель для NestJS, откуда брать данные во время работы программы
    // То есть «Возьми req.query из HTTP-запроса и положи его в эту переменную»
    @Get()
    async findAll(@Query() query: BlogQueryDto) {
        return this.blogsQueryRepository.getAll(query);
    }

    @Get(':id')
    async findById(@Param('id') id: string,) {
        return this.blogsQueryRepository.getByIdOrNotFoundFail(id);
    }

    @Get(':blogId/posts')
    async getPostsForBlog(@Param('blogId') blogId: string, @Query() query: any) {
        // Заглушка. Позже здесь будет вызов postsQueryRepository
        return 'Here will be posts for blog';
    }

    @Post(':blogId/posts')
    async createPostForBlog(@Param('blogId') blogId: string, @Body() createPostDto: any) {
        // Заглушка. Позже здесь будет вызов postsService
        return 'Here will be created post';
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