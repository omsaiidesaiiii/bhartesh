import { IsString, IsNotEmpty, IsDateString, IsEnum, IsOptional, IsUrl } from 'class-validator';
import { AcademicEventType } from '@prisma/client';

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString()
    @IsNotEmpty()
    date: string;

    @IsEnum(AcademicEventType)
    @IsNotEmpty()
    type: AcademicEventType;

    @IsUrl()
    @IsOptional()
    attachmentUrl?: string;
}
