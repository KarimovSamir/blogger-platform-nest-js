import { Type } from 'class-transformer';

export enum SortDirection {
    Asc = 'asc',
    Desc = 'desc',
}

export class BaseQueryParams {
    // Декаратор @Type берёт то что идёт после вопроса url (/users?pageNumber=2) и прекращает в то что указываем (Number)
    @Type(() => Number)
    pageNumber: number = 1;

    @Type(() => Number)
    pageSize: number = 10;

    sortDirection: SortDirection = SortDirection.Desc;

    // Метод, который сам посчитает, сколько записей пропустить в БД
    calculateSkip() {
        return (this.pageNumber - 1) * this.pageSize;
    }
}