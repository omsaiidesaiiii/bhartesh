import { IsString, IsNotEmpty, IsDateString, IsEnum } from 'class-validator';
import { AcademicYearStatus } from '@prisma/client';

export class CreateAcademicYearDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @IsDateString()
    @IsNotEmpty()
    endDate: string;

    @IsEnum(AcademicYearStatus)
    @IsNotEmpty()
    status: AcademicYearStatus;
}
