import { IsNotEmpty, IsString } from "class-validator";

export class RegistrationConfirmationAuthDto {
    @IsNotEmpty()
    @IsString()
    code: string;
};
