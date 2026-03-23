import { forwardRef, Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { MongooseModule } from "@nestjs/mongoose";
import { Post, PostSchema } from "./domain/post.entity";
import { PostsController } from "./api/posts.controller";
import { PostsRepository } from "./infrastructure/posts.repository";
import { PostsQueryRepository } from "./infrastructure/query/posts.query-repository";
import { BlogsModule } from "../blogs/blogs.module";
import { CommentsModule } from "../comments/comments.module";
import { DeletePostUseCase } from "./application/use-cases/delete-post.use-case";
import { CreatePostUseCase } from "./application/use-cases/create-post.use-case";
import { UpdatePostUseCase } from "./application/use-cases/update-post.use-case";
import { CreatePostForBlogUseCase } from "./application/use-cases/create-post-for-blog.use-case";

const useCases = [CreatePostUseCase, DeletePostUseCase, UpdatePostUseCase, CreatePostForBlogUseCase];

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
        CqrsModule,
        forwardRef(() => BlogsModule),
        forwardRef(() => CommentsModule),
    ],
    controllers: [PostsController],
    providers: [
        PostsRepository,
        PostsQueryRepository,
        ...useCases
    ],
    exports: [
        PostsQueryRepository
    ]
})
export class PostsModule {}
