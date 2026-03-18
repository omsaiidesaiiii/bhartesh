import { Module } from '@nestjs/common';
import { NoticesService } from './notices.service';
import { NoticesController } from './notices.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { FcmModule } from '../fcm/fcm.module';

@Module({
    imports: [PrismaModule, FcmModule],
    controllers: [NoticesController],
    providers: [NoticesService],
    exports: [NoticesService]
})
export class NoticesModule { }
