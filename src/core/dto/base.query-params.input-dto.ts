import { Type } from 'class-transformer';
import { IsInt, Min, Max, IsOptional, IsEnum } from 'class-validator';

export enum SortDirection {
    Asc = 'asc',
    Desc = 'desc',
}

export class BaseQueryParams {
    @IsOptional()
    // Декаратор @Type берёт то что идёт после вопроса url (/users?pageNumber=2) и прекращает в то что указываем (Number)
    @Type(() => Number)
    @IsInt({ message: 'Page number must be an integer' })
    @Min(1, { message: 'Page number must be a positive integer' })
    pageNumber: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Page size must be an integer' })
    @Min(1, { message: 'Page size must be between 1 and 100' })
    @Max(100, { message: 'Page size must be between 1 and 100' })
    pageSize: number = 10;

    @IsOptional()
    @IsEnum(SortDirection)
    sortDirection: SortDirection = SortDirection.Desc;

    // Метод, который сам посчитает, сколько записей пропустить в БД
    calculateSkip() {
        return (this.pageNumber - 1) * this.pageSize;
    }
}