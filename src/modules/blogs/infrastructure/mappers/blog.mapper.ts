import { Blog } from "../../domain/blog.entity";

// Преобразует плоскую строку из БД в объект класса Device с методами
export function mapRowToBlog(row: any): Blog {
    const blog = new Blog();
    blog.id = row.id;
    blog.name = row.name;
    blog.description = row.description;
    blog.websiteUrl = row.websiteUrl;
    // PostgreSQL возвращает TIMESTAMP как Date-объект, приводим к ISO-строке
    blog.createdAt = new Date(row.createdAt).toISOString();
    blog.isMembership = row.isMembership;
    blog.deletedAt = row.deletedAt;
    return blog;
}
