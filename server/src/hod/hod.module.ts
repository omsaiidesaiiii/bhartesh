import { Module } from '@nestjs/common';
import { HodService } from './hod.service';
import { HodController } from './hod.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [HodController],
    providers: [HodService],
})
export class HodModule { }
