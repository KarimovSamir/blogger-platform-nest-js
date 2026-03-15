import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../application/auth.service';
import { UserContextDto } from '../dto/user-context.dto';

@Injectable()
// Наследуемся от базового класса PassportStrategy, передаем ему тип Strategy (Local)
export class LocalStrategy extends PassportStrategy(Strategy) {
    
    // Внедряем AuthService, так как именно в нем лежит метод проверки пароля
    constructor(private authService: AuthService) {
        // Здесь мы говорим стратегии: "Ищи логин в поле loginOrEmail".
        super({ usernameField: 'loginOrEmail' }); 
    }

    // Этот метод автоматически вызовется самим Passport-ом, когда придет запрос на логин.
    // Passport сам достанет loginOrEmail и password из тела запроса и передаст их сюда.
    async validate(username: string, password: string): Promise<UserContextDto> {
        
        // 1. Вызываем метод из Шага 1
        const userId = await this.authService.validateUser(username, password);
        
        // 2. Если метод вернул null (пароль не совпал или юзера нет)
        if (!userId) {
            // Кидаем 401 ошибку. Запрос обрывается, контроллер даже не начнет работу.
            throw new UnauthorizedException('Invalid username or password');
        }

        // 3. Если всё ок, формируем объект "бейджика" (UserContextDto)
        // То, что мы возвращаем здесь, NestJS автоматически положит в объект req.user!
        return { id: userId };
    }
}