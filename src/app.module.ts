import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        // isGlobal: true делает так, что .env доступен во всем приложении
        ConfigModule.forRoot({ isGlobal: true }),
        // Когда сервер запускается, он выполняет MongooseModule.forRoot()
        // NestJS сам установит и будет удерживать соединение
        MongooseModule.forRoot(process.env.MONGO_URL || ""),
        UsersModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
