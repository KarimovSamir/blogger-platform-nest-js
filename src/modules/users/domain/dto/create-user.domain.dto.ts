export class CreateUserDomainDto {
    login: string;
    email: string;
    passwordHash: string;
    // Делаем опциональными (добавляем знак вопроса)
    confirmationCode?: string; 
    expirationDate?: Date;
    // Флаг, который скажет фабрике, подтвержден ли юзер сразу
    isEmailConfirmed?: boolean;
}