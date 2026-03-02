import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsModule } from './modules/blogs/blogs.module';
import { PostsModule } from './modules/posts/posts.module';

@Module({
    imports: [
        // isGlobal: true делает так, что .env доступен во всем приложении
        ConfigModule.forRoot({ isGlobal: true }),
        // Когда сервер запускается, он выполняет MongooseModule.forRoot()
        // NestJS сам установит и будет удерживать соединение
        MongooseModule.forRoot(process.env.MONGO_URL || ""),
        UsersModule,
        BlogsModule,
        PostsModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
