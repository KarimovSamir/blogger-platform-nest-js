import { UserDocument } from "src/users/domain/user.entity";

export class UserViewDto {
    id: string;
    login: string;
    email: string;
    createdAt: string;

    // маппер
    static mapToView(user: UserDocument): UserViewDto {
        const dto = new UserViewDto();
        dto.id = user._id.toString(); // возвращает ObjectId, нужна строка
        dto.login = user.login;
        dto.email = user.email;
        dto.createdAt = user.createdAt.toISOString();
        return dto;
    }
}