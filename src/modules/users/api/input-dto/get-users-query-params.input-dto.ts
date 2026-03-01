import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BaseQueryParams, SortDirection } from '../../../../core/dto/base.query-params.input-dto';


// Наследуем (extends) pageNumber, pageSize, sortDirection и calculateSkip
export class UserQueryDto extends BaseQueryParams {
    @IsOptional()
    @IsString()
    searchLoginTerm?: string | null = null;

    @IsOptional()
    @IsString()
    searchEmailTerm?: string | null = null;

    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';
    
    // Переопределяем дефолтное значение для юзеров, если нужно
    @IsOptional()
    @IsEnum(SortDirection)
    sortDirection: SortDirection = SortDirection.Desc;
}