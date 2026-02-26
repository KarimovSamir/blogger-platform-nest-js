export enum SortDirection {
    Asc = 'asc',
    Desc = 'desc',
}

export type PaginatedOutput<T> = {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: T[];
};