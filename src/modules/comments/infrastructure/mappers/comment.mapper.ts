import { Comment } from '../../domain/comment.entity';

// Преобразует плоскую строку из БД в объект класса Comment с методами
export function mapRowToComment(row: any): Comment {
    const c = new Comment();
    c.id = row.id;
    c.content = row.content;
    c.postId = row.postId;
    // commentatorInfo лежит в БД плоско (denormalized) — собираем во вложенный объект
    c.commentatorInfo = {
        userId: row.commentatorInfo_userId,
        userLogin: row.commentatorInfo_userLogin,
    };
    c.likesInfo = {
        likesCount: row.likesCount,
        dislikesCount: row.dislikesCount,
    };
    c.deletedAt = row.deletedAt;
    c.createdAt = row.createdAt ? new Date(row.createdAt).toISOString() : '';
    return c;
}
