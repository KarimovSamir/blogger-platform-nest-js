import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        
        // Получаем то, что ты передал в throw new BadRequestException(...)
        const exceptionResponse: any = exception.getResponse();

        if (status === HttpStatus.BAD_REQUEST) {
            const errorsMessages: any[] = [];

            // Если ты передал объект с полем field (наша кастомная бизнес-ошибка)
            if (exceptionResponse.field && exceptionResponse.message) {
                errorsMessages.push({
                    message: exceptionResponse.message,
                    field: exceptionResponse.field,
                });
            } 
            // Если это уже готовый массив (например, если в будущем подключим class-validator)
            else if (Array.isArray(exceptionResponse.message)) {
                errorsMessages.push(...exceptionResponse.message);
            } 
            // Фолбэк на случай обычной строковой ошибки
            else {
                errorsMessages.push({
                    message: exceptionResponse.message || 'Bad Request',
                    field: 'unknown',
                });
            }

            // Отдаем строго в формате it-incubator
            return response.status(status).json({ errorsMessages });
        }

        // Для всех остальных ошибок (401, 404 и т.д.) оставляем стандартное поведение
        response.status(status).json(exceptionResponse);
    }
}