import { Post } from '../../domain/post.entity';

// Преобразует плоскую строку из БД в объект класса Post с методами
export function mapRowToPost(row: any): Post {
    const post = new Post();
    post.id = row.id;
    post.title = row.title;
    post.shortDescription = row.shortDescription;
    post.content = row.content;
    post.blogId = row.blogId;
    post.blogName = row.blogName;
    // Счётчики хранятся в БД плоско, в entity — вложенным объектом
    post.likesInfo = {
        likesCount: row.likesCount,
        dislikesCount: row.dislikesCount,
    };
    post.deletedAt = row.deletedAt;
    // PostgreSQL возвращает TIMESTAMP как Date-объект, приводим к ISO-строке
    post.createdAt = new Date(row.createdAt).toISOString();
    return post;
}
