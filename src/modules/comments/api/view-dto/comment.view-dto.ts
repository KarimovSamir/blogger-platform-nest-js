export class CommentViewDto {
    id: string;
    content: string;
    commentatorInfo: {
        userId: string;
        userLogin: string;
    };
    createdAt: string;
    likesInfo: {
        likesCount: number;
        dislikesCount: number;
        myStatus: string;
    };

    // Принимает либо row из БД (плоский), либо объект Comment (с вложенным commentatorInfo)
    static mapToView(comment: any, myStatus: string = 'None'): CommentViewDto {
        const dto = new CommentViewDto();
        dto.id = comment.id;
        dto.content = comment.content;
        dto.commentatorInfo = comment.commentatorInfo
            ? {
                  userId: comment.commentatorInfo.userId,
                  userLogin: comment.commentatorInfo.userLogin,
              }
            : {
                  userId: comment.commentatorInfo_userId,
                  userLogin: comment.commentatorInfo_userLogin,
              };
        dto.createdAt = comment.createdAt instanceof Date
            ? comment.createdAt.toISOString()
            : comment.createdAt;
        dto.likesInfo = {
            likesCount: comment.likesInfo?.likesCount ?? comment.likesCount ?? 0,
            dislikesCount: comment.likesInfo?.dislikesCount ?? comment.dislikesCount ?? 0,
            myStatus,
        };
        return dto;
    }
}
