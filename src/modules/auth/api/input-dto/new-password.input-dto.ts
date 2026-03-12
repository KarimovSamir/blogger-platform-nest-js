import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class NewEmailPasswordRecoveryAttributes {
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(20)
    newPassword: string;

    @IsString()
    @IsNotEmpty()
    recoveryCode: string;
};
