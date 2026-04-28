import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostsController } from './api/posts.controller';
import { PostsRepository } from './infrastructure/posts.repository';
import { PostsQueryRepository } from './infrastructure/query/posts.query-repository';
import { BlogsModule } from '../blogs/blogs.module';
import { CommentsModule } from '../comments/comments.module';
import { DeletePostUseCase } from './application/use-cases/delete-post.use-case';
import { CreatePostUseCase } from './application/use-cases/create-post.use-case';
import { UpdatePostUseCase } from './application/use-cases/update-post.use-case';
import { CreatePostForBlogUseCase } from './application/use-cases/create-post-for-blog.use-case';
import { UpdatePostLikeStatusUseCase } from './application/use-cases/update-post-like-status.use-case';
import { LikesModule } from '../likes/likes.module';

const useCases = [
    CreatePostUseCase,
    DeletePostUseCase,
    UpdatePostUseCase,
    CreatePostForBlogUseCase,
    UpdatePostLikeStatusUseCase
];

@Module({
    imports: [
        CqrsModule,
        forwardRef(() => BlogsModule),
        forwardRef(() => CommentsModule),
        LikesModule
    ],
    controllers: [PostsController],
    providers: [PostsRepository, PostsQueryRepository, ...useCases],
    exports: [PostsQueryRepository],
})
export class PostsModule {}
