import { PostDocument } from "../../domain/post.entity";

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
        post: PostDocument,
        myStatus: string = 'None',
        newestLikes: Array<{ addedAt: string; userId: string; login: string }> = [],
    ): PostViewDto {
        const dto = new PostViewDto();
        dto.id = post._id.toString();
        dto.title = post.title;
        dto.shortDescription = post.shortDescription;
        dto.content = post.content;
        dto.blogId = post.blogId;
        dto.blogName = post.blogName;
        dto.createdAt = post.createdAt.toISOString();
        dto.extendedLikesInfo = {
            likesCount: post.likesInfo?.likesCount ?? 0,  // читаем из документа
            dislikesCount: post.likesInfo?.dislikesCount ?? 0,
            myStatus,
            newestLikes,
        };
        return dto;
    }

}