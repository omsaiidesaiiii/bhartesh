import { Module } from '@nestjs/common';
import { InternalMarksService } from './internal-marks.service';
import { InternalMarksController } from './internal-marks.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [InternalMarksController],
    providers: [InternalMarksService],
    exports: [InternalMarksService],
})
export class InternalMarksModule { }
