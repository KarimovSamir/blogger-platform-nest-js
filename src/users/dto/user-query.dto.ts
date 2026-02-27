import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SortDirection } from '../../common/types/pagination';

export class UserQueryDto {
    @IsOptional()
    @IsString()
    // Явно указываем TypeScript что null тоже разрешен
    searchLoginTerm?: string | null = null;

    @IsOptional()
    @IsString()
    searchEmailTerm?: string | null = null;

    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @IsOptional()
    @IsEnum(SortDirection) // Проверяет, что значение только 'asc' или 'desc'
    sortDirection?: SortDirection = SortDirection.Desc;

    @IsOptional()
    @Type(() => Number) // Аналог .toInt()
    @IsInt()
    @Min(1)
    pageNumber?: number = 1; // Дефолтное значение

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageSize?: number = 10;
}