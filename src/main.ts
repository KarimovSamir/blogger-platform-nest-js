import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './core/exceptions/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Включаем глобальную валидацию
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true, // Автоматически преобразует типы (например, строку в число, если в DTO указан number)
            // whitelist: true, // (Опционально) отсекает поля, которых нет в DTO
        }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
