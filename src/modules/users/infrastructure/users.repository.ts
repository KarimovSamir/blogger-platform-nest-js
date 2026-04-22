import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../domain/user.entity';

@Injectable()
export class UsersRepository {
    // Внедряем DataSource — это наше соединение с PostgreSQL (аналог userModel в Mongoose)
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    // Получаем объект или null
    // Можно использовать если отсутствие юзера - не проблема
    async findById(id: string): Promise<User | null> {
        const result = await this.dataSource.query(
            `SELECT * FROM users WHERE id = $1 AND "deletedAt" IS NULL`,
            [id],
        );
        // query всегда возвращает массив, берём первый элемент или null
        return result[0] ?? null;
    }

    // Получаем объект или ошибку
    // Можно не писать в логике проверки, если юзера нет, то сразу ошибка
    async findOrNotFoundFail(id: string): Promise<User> {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async findByLoginOrEmail(login: string, email: string): Promise<User | null> {
        const result = await this.dataSource.query(
            `SELECT * FROM users 
             WHERE (login = $1 OR email = $2) 
             AND "deletedAt" IS NULL`,
            [login, email],
        );
        return result[0] ?? null;
    }

    async findByConfirmationCode(confirmationCode: string): Promise<User | null> {
        const result = await this.dataSource.query(
            `SELECT * FROM users 
             WHERE "emailConfirmation_confirmationCode" = $1 
             AND "deletedAt" IS NULL`,
            [confirmationCode],
        );
        return result[0] ?? null;
    }

    async findByPasswordRecoveryCode(recoveryCode: string): Promise<User | null> {
        const result = await this.dataSource.query(
            `SELECT * FROM users 
             WHERE "passwordRecovery_recoveryCode" = $1 
             AND "deletedAt" IS NULL`,
            [recoveryCode],
        );
        return result[0] ?? null;
    }

    // В Mongoose был метод save() на документе — он сам понимал INSERT или UPDATE.
    // В raw SQL нам нужно явно разделить создание и обновление.
    async save(user: User): Promise<User> {
        if (!user.id) {
            // INSERT — если id нет, значит юзер новый
            const result = await this.dataSource.query(
                `INSERT INTO users (
                    login,
                    email,
                    "passwordHash",
                    "isEmailConfirmed",
                    "emailConfirmation_confirmationCode",
                    "emailConfirmation_expirationDate",
                    "emailConfirmation_isConfirmed",
                    "passwordRecovery_recoveryCode",
                    "passwordRecovery_expirationDate",
                    "deletedAt",
                    "createdAt",
                    "updatedAt"
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
                RETURNING *`,
                [
                    user.login,
                    user.email,
                    user.passwordHash,
                    user.isEmailConfirmed,
                    user.emailConfirmation.confirmationCode,
                    user.emailConfirmation.expirationDate,
                    user.emailConfirmation.isConfirmed,
                    user.passwordRecovery.recoveryCode,
                    user.passwordRecovery.expirationDate,
                    user.deletedAt,
                ],
            );
            return result[0];
        } else {
            // UPDATE — если id есть, значит юзер уже существует в БД
            const result = await this.dataSource.query(
                `UPDATE users SET
                    login = $1,
                    email = $2,
                    "passwordHash" = $3,
                    "isEmailConfirmed" = $4,
                    "emailConfirmation_confirmationCode" = $5,
                    "emailConfirmation_expirationDate" = $6,
                    "emailConfirmation_isConfirmed" = $7,
                    "passwordRecovery_recoveryCode" = $8,
                    "passwordRecovery_expirationDate" = $9,
                    "deletedAt" = $10,
                    "updatedAt" = NOW()
                WHERE id = $11
                RETURNING *`,
                [
                    user.login,
                    user.email,
                    user.passwordHash,
                    user.isEmailConfirmed,
                    user.emailConfirmation.confirmationCode,
                    user.emailConfirmation.expirationDate,
                    user.emailConfirmation.isConfirmed,
                    user.passwordRecovery.recoveryCode,
                    user.passwordRecovery.expirationDate,
                    user.deletedAt,
                    user.id,
                ],
            );
            return result[0];
        }
    }
}