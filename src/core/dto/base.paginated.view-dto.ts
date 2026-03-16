import { Type } from 'class-transformer';

export abstract class PaginatedViewDto<T> {
    abstract items: T;
    @Type(() => Number)
    totalCount: number;

    @Type(() => Number)
    pagesCount: number;

    @Type(() => Number)
    page: number;

    @Type(() => Number)
    pageSize: number;

    public static mapToView<T>(data: {
        items: T;
        page: number;
        size: number;
        totalCount: number;
    }): PaginatedViewDto<T> {
        return {
            totalCount: data.totalCount,
            pagesCount: Math.ceil(data.totalCount / data.size),
            page: data.page,
            pageSize: data.size,
            items: data.items,
        };
    }
}