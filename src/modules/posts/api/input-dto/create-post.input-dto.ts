import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePostInputDto {
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
    content: string;

    @IsString()
    @IsNotEmpty()
    blogId: string;
}
