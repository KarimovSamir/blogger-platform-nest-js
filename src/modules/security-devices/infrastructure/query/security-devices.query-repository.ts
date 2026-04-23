import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DeviceViewDto } from '../../api/view-dto/device.view-dto';

@Injectable()
export class SecurityDevicesQueryRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async findAllByUserId(userId: string): Promise<DeviceViewDto[]> {
        const devices = await this.dataSource.query(
            `SELECT * FROM devices WHERE "userId" = $1 ORDER BY "lastActiveDate" DESC`,
            [userId],
        );

        return devices.map(DeviceViewDto.mapToView);
    }
}
