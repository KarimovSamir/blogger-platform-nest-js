import { Like } from '../../domain/like.entity';
import { LikeStatus } from '../../api/input-dto/like.input-dto';

export function mapRowToLike(row: any): Like {
    const like = new Like();
    like.id = row.id;
    like.parentId = row.parentId;
    like.userId = row.userId;
    like.login = row.login;
    like.status = row.status as LikeStatus;
    like.createdAt = row.createdAt ? new Date(row.createdAt).toISOString() : '';
    like.updatedAt = row.updatedAt ? new Date(row.updatedAt).toISOString() : '';
    return like;
}
