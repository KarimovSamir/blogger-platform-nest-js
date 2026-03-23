import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CommentInputDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(20)
    @MaxLength(300)
    content: string;
}