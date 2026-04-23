import { Device } from '../../domain/device.entity';

// Преобразует плоскую строку из БД в объект класса Device с методами
export function mapRowToDevice(row: any): Device {
    const device = new Device();
    device.id = row.id;
    device.userId = row.userId;
    device.deviceId = row.deviceId;
    device.ip = row.ip;
    device.title = row.title;
    // PostgreSQL возвращает TIMESTAMP как Date-объект, приводим к ISO-строке
    device.lastActiveDate = new Date(row.lastActiveDate).toISOString();
    device.expireAt = row.expireAt;
    return device;
}
