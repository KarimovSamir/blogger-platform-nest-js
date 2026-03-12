import { IsNotEmpty, Matches } from "class-validator";

export class PasswordRecoveryAuthDto {
    @Matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)
    @IsNotEmpty()
    email: string;
};