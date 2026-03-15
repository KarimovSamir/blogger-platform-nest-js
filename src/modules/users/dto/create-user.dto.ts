import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

// Описание того, какие данные мы ожидаем получить
export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(10)
    login: string;
    
    @IsNotEmpty()
    @IsString()
    @Matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    password: string;
}
