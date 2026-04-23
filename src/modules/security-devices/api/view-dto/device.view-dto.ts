import { Device } from '../../domain/device.entity';

// То что показываем/отдаём наружу
export class DeviceViewDto {
    ip: string;
    title: string;
    lastActiveDate: string;
    deviceId: string;

    static mapToView(device: Device): DeviceViewDto {
        const dto = new DeviceViewDto();
        dto.ip = device.ip;
        dto.title = device.title;
        dto.lastActiveDate = device.lastActiveDate;
        dto.deviceId = device.deviceId;
        return dto;
    }
}
