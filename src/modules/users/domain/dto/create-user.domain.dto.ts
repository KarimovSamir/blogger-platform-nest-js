export class CreateUserDomainDto {
    login: string;
    email: string;
    passwordHash: string;
    emailConfirmation: {
        confirmationCode: string;
        expirationDate: Date;
        isConfirmed: boolean;
    };
}