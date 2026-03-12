import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegistrationAuthDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(10)
    login: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(20)
    password: string;

    @Matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)
    @IsNotEmpty()
    email: string;
};