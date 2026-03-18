import { IsString, IsNumber, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertExternalMarkDto {
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

    @ApiProperty({ required: false, default: 80 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    maxMarks?: number;

    @ApiProperty()
    @IsInt()
    @Min(1)
    @Max(8)
    semester: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    remarks?: string;
}
