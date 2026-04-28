// Структура счётчиков лайков, которая хранится внутри Post
class PostLikesInfo {
    likesCount: number;
    dislikesCount: number;
}

export class Post {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    deletedAt: Date | null;
    // хранение счетчиков лайков в базу
    likesInfo: PostLikesInfo;
    createdAt: string;

    static createInstance(
        title: string,
        shortDescription: string,
        content: string,
        blogId: string,
        blogName: string,
    ): Post {
        const post = new Post();
        post.title = title;
        post.shortDescription = shortDescription;
        post.content = content;
        post.blogId = blogId;
        post.blogName = blogName;
        post.likesInfo = { likesCount: 0, dislikesCount: 0 };
        post.deletedAt = null;
        return post;
    }

    // обновления счетчиков, вызывается из UseCase
    updateLikesCount(likesCount: number, dislikesCount: number) {
        this.likesInfo.likesCount = likesCount;
        this.likesInfo.dislikesCount = dislikesCount;
    }

    update(dto: {
        title: string;
        shortDescription: string;
        content: string;
        blogId: string;
    }) {
        this.title = dto.title;
        this.shortDescription = dto.shortDescription;
        this.content = dto.content;
        this.blogId = dto.blogId;
    }

    makeDeleted() {
        if (this.deletedAt !== null) {
            throw new Error('Entity already deleted');
        }
        this.deletedAt = new Date();
    }
}
