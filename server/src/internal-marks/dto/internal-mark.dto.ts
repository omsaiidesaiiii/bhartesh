import { IsString, IsNumber, IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AssessmentType } from '@prisma/client';

export class UpsertInternalMarkDto {
    @ApiProperty()
    @IsString()
    studentId: string;

    @ApiProperty()
    @IsString()
    subjectId: string;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    marks: number;

    @ApiProperty({ required: false, default: 20 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    maxMarks?: number;

    @ApiProperty()
    @IsInt()
    @Min(1)
    @Max(8)
    semester: number;

    @ApiProperty({ enum: AssessmentType, default: AssessmentType.IA1 })
    @IsEnum(AssessmentType)
    @IsOptional()
    assessmentType?: AssessmentType;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    remarks?: string;
}
