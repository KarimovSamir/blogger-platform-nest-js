import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe, INestApplication } from '@nestjs/common';
import { HttpExceptionFilter } from './core/exceptions/http-exception.filter';
import cookieParser from 'cookie-parser';

// Переменная для кэширования сервера на Vercel
let cachedServer: any;

// Выносим всю настройку приложения в отдельную функцию, чтобы не дублировать код
function appSetup(app: INestApplication) {
    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
        exceptionFactory: (errors) => {
            const errorsForResponse: any[] = [];
            
            errors.forEach(e => {
                if (e.constraints) {
                    const constraintsKeys = Object.keys(e.constraints);
                    constraintsKeys.forEach(cKey => {
                        errorsForResponse.push({
                            message: e.constraints![cKey],
                            field: e.property 
                        });
                    });
                }
            });
            
            throw new BadRequestException(errorsForResponse);
        }
    }));

    app.use(cookieParser());
    app.useGlobalFilters(new HttpExceptionFilter());
}

// Инициализация для Vercel (без прослушивания порта)
async function bootstrap() {
    if (!cachedServer) {
        const app = await NestFactory.create(AppModule);
        appSetup(app); // Применяем твои настройки
        await app.init();
        // Достаем "чистый" инстанс Express
        cachedServer = app.getHttpAdapter().getInstance();
    }
    return cachedServer;
}

// Инициализация для локальной разработки
// Vercel автоматически добавляет переменную process.env.VERCEL, 
// поэтому локально это условие сработает, а на проде - нет.
if (!process.env.VERCEL) {
    async function startLocal() {
        const app = await NestFactory.create(AppModule);
        appSetup(app); // Применяем те же настройки
        
        const port = process.env.PORT ?? 3000;
        await app.listen(port);
        console.log(`Local server started on port ${port}`);
    }
    startLocal();
}

// Обязательный экспорт для Serverless-окружения Vercel
export default async (req: any, res: any) => {
    const server = await bootstrap();
    return server(req, res);
};