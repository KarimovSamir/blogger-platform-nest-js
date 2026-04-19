import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateDeviceDomainDto } from '../dto/device.dto';

@Schema({ timestamps: true })
export class Device {
    @Prop({ type: String, required: true })
    userId: string;

    @Prop({ type: String, required: true, unique: true })
    deviceId: string;

    @Prop({ type: String, required: true })
    ip: string;

    @Prop({ type: String, required: true })
    title: string;

    @Prop({ type: String, required: true })
    lastActiveDate: string;

    @Prop({ type: Date, required: true })
    expireAt: Date;

    // паттерн фабрика
    static createInstance(dto: CreateDeviceDomainDto): DeviceDocument {
        const device = new this();
        device.userId = dto.userId;
        device.deviceId = dto.deviceId;
        device.ip = dto.ip;
        device.title = dto.title;
        device.lastActiveDate = dto.lastActiveDate;
        device.expireAt = dto.expireAt;
        return device as DeviceDocument;
    }

    // Метод для обновления при refresh-token
    updateActivity(lastActiveDate: string, ip: string, title: string) {
        this.lastActiveDate = lastActiveDate;
        this.ip = ip;
        this.title = title;
    }
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
// это магия Mongoose, которая делает методы класса доступными и как статические (для createInstance), и как instance-методы (для updateActivity). Без этой строчки фабричный метод не будет работать через модель.
DeviceSchema.loadClass(Device);

export type DeviceDocument = HydratedDocument<Device>;
export type DeviceModelType = Model<DeviceDocument> & typeof Device;