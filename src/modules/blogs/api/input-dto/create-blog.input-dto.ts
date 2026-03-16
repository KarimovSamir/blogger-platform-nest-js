import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBlogDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(15)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(500)
    description: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    // @IsUrl()
    websiteUrl: string;
}