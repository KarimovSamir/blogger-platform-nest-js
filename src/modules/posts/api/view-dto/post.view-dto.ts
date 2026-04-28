export class PostViewDto {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string;
    extendedLikesInfo: {
        likesCount: number;
        dislikesCount: number;
        myStatus: string;
        newestLikes: Array<{
            addedAt: string;
            userId: string;
            login: string;
        }>;
    };

    static mapToView(
        post: any,
        myStatus: string = 'None',
        newestLikes: Array<{ addedAt: string; userId: string; login: string }> = [],
    ): PostViewDto {
        const dto = new PostViewDto();
        dto.id = post.id;
        dto.title = post.title;
        dto.shortDescription = post.shortDescription;
        dto.content = post.content;
        dto.blogId = post.blogId;
        dto.blogName = post.blogName;
        // post может прийти как плоская строка из БД (createdAt — Date)
        // или как объект класса Post (createdAt — string после маппера)
        dto.createdAt = post.createdAt instanceof Date
            ? post.createdAt.toISOString()
            : post.createdAt;
        dto.extendedLikesInfo = {
            // если есть вложенный likesInfo — берём оттуда (объект класса Post),
            // иначе берём плоские поля (плоская строка из БД)
            likesCount: post.likesInfo?.likesCount ?? post.likesCount ?? 0,
            dislikesCount: post.likesInfo?.dislikesCount ?? post.dislikesCount ?? 0,
            myStatus,
            newestLikes,
        };
        return dto;
    }
}
