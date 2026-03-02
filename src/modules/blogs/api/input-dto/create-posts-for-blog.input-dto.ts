import { IsNotEmpty, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreatePostForBlogDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(30)
    title: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    shortDescription: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(1000)
    @IsUrl()
    content: string;
}