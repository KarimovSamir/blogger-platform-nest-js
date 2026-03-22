import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsModule } from './modules/blogs/blogs.module';
import { PostsModule } from './modules/posts/posts.module';
import { TestingModule } from './modules/testing/testing.module';
import { CommentsModule } from './modules/comments/comments.module';
import { AuthModule } from './modules/auth/auth.module';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
    imports: [
        // isGlobal: true делает так, что .env доступен во всем приложении
        ConfigModule.forRoot({ isGlobal: true }),
        // Когда сервер запускается, он выполняет MongooseModule.forRoot()
        // NestJS сам установит и будет удерживать соединение
        MongooseModule.forRoot(process.env.MONGO_URL || ""),
        CqrsModule.forRoot(),
        UsersModule,
        BlogsModule,
        PostsModule,
        CommentsModule,
        TestingModule,
        AuthModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
