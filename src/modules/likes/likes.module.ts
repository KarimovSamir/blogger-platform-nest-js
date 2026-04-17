import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Like, LikeSchema } from './domain/like.entity';
import { LikesRepository } from './infrastructure/likes.repository';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
    ],
    providers: [
        LikesRepository
    ],
    exports: [
        LikesRepository 
    ]
})
export class LikesModule {}