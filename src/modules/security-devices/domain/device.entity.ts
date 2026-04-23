import { CreateDeviceDomainDto } from '../dto/device.dto';

export class Device {
    id: string;
    userId: string;
    deviceId: string;
    ip: string;
    title: string;
    lastActiveDate: string;
    expireAt: Date;

    static createInstance(dto: CreateDeviceDomainDto): Device {
        const device = new Device();
        device.userId = dto.userId;
        device.deviceId = dto.deviceId;
        device.ip = dto.ip;
        device.title = dto.title;
        device.lastActiveDate = dto.lastActiveDate;
        device.expireAt = dto.expireAt;
        return device;
    }

    updateActivity(lastActiveDate: string, ip: string, title: string): void {
        this.lastActiveDate = lastActiveDate;
        this.ip = ip;
        this.title = title;
    }
}
