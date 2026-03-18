import { IsString, IsEmail, IsOptional, IsInt, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    departmentId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    semester?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    section?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    regno?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    cgpa?: number;
}

export class UpdateStudentDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    departmentId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    semester?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    section?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    regno?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    cgpa?: number;
}

export class BulkPromoteDto {
    @ApiProperty()
    studentIds: string[];

    @ApiProperty()
    @IsInt()
    targetSemester: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    section?: string;
}
