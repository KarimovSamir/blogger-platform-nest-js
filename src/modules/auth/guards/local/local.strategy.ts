import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserContextDto } from '../dto/user-context.dto';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BcryptService } from '../../../../core/adapters/bcrypt.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    
    constructor(
        private usersRepository: UsersRepository,
        private bcryptService: BcryptService,
    ) {
        super({ usernameField: 'loginOrEmail' }); 
    }

    async validate(username: string, password: string): Promise<UserContextDto> {
        // 1. Ищем пользователя по логину или email
        const user = await this.usersRepository.findByLoginOrEmail(
            username.trim(),
            username.trim().toLowerCase()
        );
        
        if (!user) {
            throw new UnauthorizedException('Invalid username or password');
        }

        // 2. Сравниваем пароль
        const checkPassword = await this.bcryptService.checkPassword(password, user.passwordHash);
        
        if (!checkPassword) {
            throw new UnauthorizedException('Invalid username or password');
        }

        // 3. Возвращаем бейджик, который упадет в req.user
        return { id: user.id, login: user.login };

    }
}