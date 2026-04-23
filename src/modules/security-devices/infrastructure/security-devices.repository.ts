import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Device } from '../domain/device.entity';
import { mapRowToDevice } from './mappers/device.mapper';

@Injectable()
export class SecurityDevicesRepository {
    // Внедряем DataSource — соединение с PostgreSQL
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async findByDeviceId(deviceId: string): Promise<Device | null> {
        const result = await this.dataSource.query(
            `SELECT * FROM devices WHERE "deviceId" = $1`,
            [deviceId],
        );
        // query всегда возвращает массив, берём первый элемент или null
        return result[0] ? mapRowToDevice(result[0]) : null;
    }

    // В Mongoose был метод save() на документе — он сам понимал INSERT или UPDATE.
    // В raw SQL нужно явно разделить создание и обновление.
    async save(device: Device): Promise<void> {
        if (!device.id) {
            // INSERT — если id нет, значит сессия новая
            await this.dataSource.query(
                `INSERT INTO devices (
                    "userId",
                    "deviceId",
                    ip,
                    title,
                    "lastActiveDate",
                    "expireAt"
                ) VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    device.userId,
                    device.deviceId,
                    device.ip,
                    device.title,
                    device.lastActiveDate,
                    device.expireAt,
                ],
            );
        } else {
            // UPDATE — если id есть, значит сессия уже в БД (refresh-token)
            await this.dataSource.query(
                `UPDATE devices SET
                    ip = $1,
                    title = $2,
                    "lastActiveDate" = $3
                WHERE id = $4`,
                [
                    device.ip,
                    device.title,
                    device.lastActiveDate,
                    device.id,
                ],
            );
        }
    }

    async deleteByDeviceId(deviceId: string): Promise<void> {
        await this.dataSource.query(
            `DELETE FROM devices WHERE "deviceId" = $1`,
            [deviceId],
        );
    }

    async deleteAllExceptCurrent(userId: string, currentDeviceId: string): Promise<void> {
        await this.dataSource.query(
            `DELETE FROM devices WHERE "userId" = $1 AND "deviceId" != $2`,
            [userId, currentDeviceId],
        );
    }
}
