import { IsEnum } from 'class-validator';

export enum LikeStatus {
    None = 'None',
    Like = 'Like',
    Dislike = 'Dislike',
}

export class LikeInputDto {
    @IsEnum(LikeStatus)
    likeStatus: LikeStatus;
}
