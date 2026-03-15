import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class LoginAuthDto {
    @IsNotEmpty()
    @IsString()
    loginOrEmail: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    password: string;
};
