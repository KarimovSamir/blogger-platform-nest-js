import { IsOptional, IsString } from "class-validator";
import { BaseQueryParams } from "../../../../core/dto/base.query-params.input-dto";

export class BlogQueryDto extends BaseQueryParams {
    @IsOptional()
    @IsString()
    searchNameTerm?: string | null = null;

    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';
}