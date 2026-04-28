import { Blog } from "../../domain/blog.entity";

export class BlogViewDto {
    id: string;
    name: string;
    description: string;
    websiteUrl: string;
    createdAt: string;
    isMembership: boolean;

    static mapToView(blog: any): BlogViewDto {
        const dto = new BlogViewDto();
        dto.id = blog.id;
        dto.name = blog.name;
        dto.description = blog.description;
        dto.websiteUrl = blog.websiteUrl;
        // PostgreSQL возвращает TIMESTAMP как Date-объект
        dto.createdAt = blog.createdAt instanceof Date
            ? blog.createdAt.toISOString()
            : blog.createdAt;
        dto.isMembership = blog.isMembership;
        return dto;
    }
}
