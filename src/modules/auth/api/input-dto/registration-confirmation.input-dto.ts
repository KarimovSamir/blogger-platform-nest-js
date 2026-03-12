import { IsNotEmpty, IsString } from "class-validator";

export class RegistrationConfirmationAuthDto {
    @IsString()
    @IsNotEmpty()
    code: string;
};
