import { User } from '../../domain/user.entity';

// Преобразует плоскую строку из БД обратно в объект класса User
// с вложенными объектами и методами (makeDeleted, confirmEmail и т.д.)
export function mapRowToUser(row: any): User {
    const user = new User();
    user.id = row.id;
    user.login = row.login;
    user.email = row.email;
    user.passwordHash = row.passwordHash;
    user.isEmailConfirmed = row.isEmailConfirmed;
    user.emailConfirmation = {
        confirmationCode: row.emailConfirmation_confirmationCode,
        expirationDate: row.emailConfirmation_expirationDate,
        isConfirmed: row.emailConfirmation_isConfirmed,
    };
    user.passwordRecovery = {
        recoveryCode: row.passwordRecovery_recoveryCode,
        expirationDate: row.passwordRecovery_expirationDate,
    };
    user.deletedAt = row.deletedAt;
    user.createdAt = row.createdAt;
    user.updatedAt = row.updatedAt;
    return user;
}
