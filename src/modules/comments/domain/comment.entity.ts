// Денормализованная информация об авторе — храним userLogin прямо в комментарии,
// чтобы не делать JOIN с users на каждое чтение
class CommentatorInfo {
    userId: string;
    userLogin: string;
}

class CommentLikesInfo {
    likesCount: number;
    dislikesCount: number;
}

export class Comment {
    id: string;
    content: string;
    postId: string;
    commentatorInfo: CommentatorInfo;
    likesInfo: CommentLikesInfo;
    deletedAt: Date | null;
    createdAt: string;

    static createInstance(
        content: string,
        commentatorInfo: { userId: string; userLogin: string },
        postId: string,
    ): Comment {
        const comment = new Comment();
        comment.content = content;
        comment.commentatorInfo = commentatorInfo;
        comment.postId = postId;
        comment.likesInfo = { likesCount: 0, dislikesCount: 0 };
        comment.deletedAt = null;
        return comment;
    }

    update(content: string) {
        this.content = content;
    }

    updateLikesCount(likesCount: number, dislikesCount: number) {
        this.likesInfo.likesCount = likesCount;
        this.likesInfo.dislikesCount = dislikesCount;
    }

    makeDeleted() {
        if (this.deletedAt !== null) {
            throw new Error('Entity already deleted');
        }
        this.deletedAt = new Date();
    }
}
