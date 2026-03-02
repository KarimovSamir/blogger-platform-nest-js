import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Post, PostSchema } from "./domain/post.entity";
import { PostsController } from "./api/posts.controller";
import { PostsService } from "./application/posts.service";
import { PostsRepository } from "./infrastructure/posts.repository";
import { PostsQueryRepository } from "./infrastructure/query/posts.query-repository";
import { BlogsModule } from "../blogs/blogs.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
        BlogsModule,
    ],
    controllers: [PostsController],
    providers: [
        PostsService,
        PostsRepository,
        PostsQueryRepository,
    ],
    exports: [
        PostsService,
        PostsQueryRepository
    ]
})
export class PostsModule {}
