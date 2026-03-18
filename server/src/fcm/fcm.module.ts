import { Module } from '@nestjs/common';
import { FcmController } from './fcm.controller';
import { FcmService } from './fcm.service';
import { PrismaModule } from '../prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  controllers: [FcmController],
  providers: [FcmService],
  exports: [FcmService]
})
export class FcmModule { }
