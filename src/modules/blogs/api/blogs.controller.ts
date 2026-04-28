import { Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import { BlogsQueryRepository } from "../infrastructure/query/blogs.query-repository";
import { BlogQueryDto } from "./input-dto/get-blogs-query-params.input-dto";
import { BlogViewDto } from "./view-dto/blog.view-dto";
import { PaginatedViewDto } from "../../../core/dto/base.paginated.view-dto";
import { PostsQueryRepository } from "../../posts/infrastructure/query/posts.query-repository";
import { PostQueryDto } from "../../posts/api/input-dto/get-posts-query-params.input-dto";
import { JwtOptionalAuthGuard } from "../../auth/guards/jwt/jwt-optional-auth.guard";

// @Query() вытаскивает данные после ? (например, ?page=1)
// @Body() вытаскивает тело POST-запроса (req.body)
// @Param() вытаскивает часть пути URL (например, :id из /blogs/123)

@Controller('blogs')
export class BlogsController {
    constructor(
        // Внедряем Query-репозиторий для GET-запросов и формирования ответов
        private readonly blogsQueryRepository: BlogsQueryRepository,
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

    @UseGuards(JwtOptionalAuthGuard)
    @Get(':blogId/posts')
    async getPostsForBlog(
        @Param('blogId') blogId: string,
        @Query() query: PostQueryDto,
        @Req() req: any,
    ) {
        await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
        return this.postsQueryRepository.getAllByBlogId(blogId, query, req.user?.userId);
    }
}