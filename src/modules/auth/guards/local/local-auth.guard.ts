import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Мы создаем свой класс, который наследуется от встроенного AuthGuard.
// Слово 'local' связывает этого охранника с LocalStrategy.
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}