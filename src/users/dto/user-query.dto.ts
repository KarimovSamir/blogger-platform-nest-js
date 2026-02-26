// src/users/dto/user-query.dto.ts
import { SortDirection } from '../../common/types/pagination';

export class UserQueryDto {
    // явно указываем TypeScript, что null тоже разрешен
    searchLoginTerm?: string | null = null;
    searchEmailTerm?: string | null = null;
    sortBy?: string = 'createdAt';
    sortDirection?: SortDirection = SortDirection.Desc;
    pageNumber?: number = 1;
    pageSize?: number = 10;
}