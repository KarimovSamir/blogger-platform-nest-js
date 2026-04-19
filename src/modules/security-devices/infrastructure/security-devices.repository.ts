import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceDocument, type DeviceModelType } from '../domain/device.entity';

@Injectable()
export class SecurityDevicesRepository {
    constructor(
        @InjectModel(Device.name) private DeviceModel: DeviceModelType,
    ) { }

    async findByDeviceId(deviceId: string): Promise<DeviceDocument | null> {
        return this.DeviceModel.findOne({ deviceId }).exec();
    }

    async save(device: DeviceDocument): Promise<void> {
        await device.save();
    }

    async deleteByDeviceId(deviceId: string): Promise<void> {
        await this.DeviceModel.deleteOne({ deviceId }).exec();
    }

    // $ne — "не равно" в Mongo.
    async deleteAllExceptCurrent(userId: string, currentDeviceId: string): Promise<void> {
        await this.DeviceModel.deleteMany({
            userId,
            deviceId: { $ne: currentDeviceId },
        }).exec();
    }
}