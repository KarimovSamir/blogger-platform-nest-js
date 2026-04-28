import { LikeStatus } from '../api/input-dto/like.input-dto';

export class Like {
    id: string;
    parentId: string;
    userId: string;
    login: string;
    status: LikeStatus;
    createdAt: string;
    updatedAt: string;

    static createInstance(
        parentId: string,
        userId: string,
        login: string,
        status: LikeStatus,
    ): Like {
        const like = new Like();
        like.parentId = parentId;
        like.userId = userId;
        like.login = login;
        like.status = status;
        return like;
    }

    updateStatus(newStatus: LikeStatus) {
        this.status = newStatus;
    }
}
