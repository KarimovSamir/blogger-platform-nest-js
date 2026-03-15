import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './core/exceptions/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe({
        stopAtFirstError: true, // если у поля несколько ошибок, покажет только первую
        exceptionFactory: (errors) => {
            const errorsForResponse: any[] = [];
            
            // Проходимся по всем ошибкам от class-validator
            errors.forEach(e => {
                // Добавляем проверку: если constraints существуют
                if (e.constraints) {
                    const constraintsKeys = Object.keys(e.constraints);
                    constraintsKeys.forEach(cKey => {
                        errorsForResponse.push({
                            message: e.constraints![cKey], // Восклицательный знак убедит TS, что тут точно есть значение
                            field: e.property 
                        });
                    });
                }
            });
            
            // Кидаем 400 ошибку с уже готовым массивом нужного формата
            throw new BadRequestException(errorsForResponse);
        }
    }));

    app.useGlobalFilters(new HttpExceptionFilter());
    
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
