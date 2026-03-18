import { Module } from '@nestjs/common';
import { AcademicYearService } from './academic-year.service';
import { AcademicYearController } from './academic-year.controller';
import { PrismaModule } from '../prisma/prisma.module';

import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [AcademicYearController],
    providers: [AcademicYearService],
})
export class AcademicYearModule { }
