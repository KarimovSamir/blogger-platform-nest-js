import { Module } from '@nestjs/common';
import { LikesRepository } from './infrastructure/likes.repository';

@Module({
    providers: [LikesRepository],
    exports: [LikesRepository],
})
export class LikesModule {}
