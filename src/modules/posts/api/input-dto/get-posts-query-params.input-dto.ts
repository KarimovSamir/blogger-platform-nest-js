import { BaseQueryParams } from "../../../../core/dto/base.query-params.input-dto";

export class PostQueryDto extends BaseQueryParams {
    sortBy: string = 'createdAt';
}
