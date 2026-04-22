import { User } from "../../domain/user.entity";

export class UserViewDto {
    id: string;
    login: string;
    email: string;
    createdAt: string;

    // маппер
    static mapToView(user: User): UserViewDto {
        const dto = new UserViewDto();
        dto.id = user.id
        dto.login = user.login;
        dto.email = user.email;
        dto.createdAt = new Date(user.createdAt).toISOString();
        return dto;
    }
}