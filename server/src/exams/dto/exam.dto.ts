import { IsString, IsEnum, IsDateString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExamType, ExamStatus, AssessmentType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateExamDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    code: string;

    @ApiProperty({ enum: ExamType })
    @IsEnum(ExamType)
    type: ExamType;

    @ApiProperty({ enum: ExamStatus, required: false })
    @IsOptional()
    @IsEnum(ExamStatus)
    status?: ExamStatus;

    @ApiProperty()
    @IsDateString()
    date: string;

    @ApiProperty()
    @IsDateString()
    startTime: string;

    @ApiProperty()
    @IsDateString()
    endTime: string;

    @ApiProperty()
    @IsString()
    room: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;
}

export class UpdateExamDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    code?: string;

    @ApiProperty({ enum: ExamType, required: false })
    @IsOptional()
    @IsEnum(ExamType)
    type?: ExamType;

    @ApiProperty({ enum: ExamStatus, required: false })
    @IsOptional()
    @IsEnum(ExamStatus)
    status?: ExamStatus;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    date?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    startTime?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    endTime?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    room?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isResultPublished?: boolean;
}

export class StudentMarkDto {
    @ApiProperty()
    @IsString()
    studentId: string;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    marks: number;
}

export class SubmitMarksDto {
    @ApiProperty()
    @IsString()
    examId: string;

    @ApiProperty()
    @IsString()
    subjectId: string;

    @ApiProperty()
    @IsNumber()
    @Min(1)
    @Max(8)
    semester: number;

    @ApiProperty({ enum: AssessmentType })
    @IsEnum(AssessmentType)
    assessmentType: AssessmentType;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    maxMarks: number;

    @ApiProperty({ type: [StudentMarkDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StudentMarkDto)
    marks: StudentMarkDto[];
}

