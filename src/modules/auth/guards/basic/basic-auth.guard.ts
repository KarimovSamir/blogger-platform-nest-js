import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new UnauthorizedException();
    }

    // Отрезаем слово 'Basic ' и декодируем строку из Base64
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    
    // Получаем 'admin' и 'qwerty'
    const [username, password] = credentials.split(':');

    // Достаем значения из .env
    const validUsername = this.configService.getOrThrow<string>('ADMIN_LOGIN');
    const validPassword = this.configService.getOrThrow<string>('ADMIN_PASSWORD');

    if (username === validUsername && password === validPassword) {
      return true;
    } else {
      throw new UnauthorizedException();
    }
  }
}