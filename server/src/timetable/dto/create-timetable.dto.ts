import { IsString, IsNotEmpty, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum DayOfWeek {
    MONDAY = 'MONDAY',
    TUESDAY = 'TUESDAY',
    WEDNESDAY = 'WEDNESDAY',
    THURSDAY = 'THURSDAY',
    FRIDAY = 'FRIDAY',
    SATURDAY = 'SATURDAY',
}

export class CreateTimetableDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    staffId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    subjectId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    departmentId: string;

    @ApiProperty({ enum: DayOfWeek })
    @IsEnum(DayOfWeek)
    dayOfWeek: DayOfWeek;

    @ApiProperty()
    @IsDateString()
    startTime: string;

    @ApiProperty()
    @IsDateString()
    endTime: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    room?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    semester?: number;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    section?: string;
}
