import { BaseQueryParams } from "../../../../core/dto/base.query-params.input-dto";

export class CommentQueryDto extends BaseQueryParams {
    sortBy: string = 'createdAt';
}
