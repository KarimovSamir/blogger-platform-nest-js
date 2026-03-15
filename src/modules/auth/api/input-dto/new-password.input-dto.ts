import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class NewEmailPasswordRecoveryAttributes {
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    newPassword: string;

    @IsNotEmpty()
    @IsString()
    recoveryCode: string;
};
