import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device, type DeviceModelType } from '../../domain/device.entity';
import { DeviceViewDto } from '../../api/view-dto/device.view-dto';

@Injectable()
export class SecurityDevicesQueryRepository {
    constructor(
        @InjectModel(Device.name) private DeviceModel: DeviceModelType,
    ) { }

    async findAllByUserId(userId: string): Promise<DeviceViewDto[]> {
        const devices = await this.DeviceModel.find({ userId })
            .sort({ lastActiveDate: -1 })
            .exec();

        return devices.map(DeviceViewDto.mapToView);
    }
}