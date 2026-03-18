import { IsString, IsNotEmpty, IsOptional, IsInt, IsDateString } from 'class-validator';

export class CreateAssignmentDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString()
    @IsNotEmpty()
    dueDate: string;

    @IsInt()
    @IsNotEmpty()
    semester: number;

    @IsString()
    @IsNotEmpty()
    departmentId: string;

    @IsString()
    @IsOptional()
    subjectId?: string;
}

export class UpdateAssignmentDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString()
    @IsOptional()
    dueDate?: string;

    @IsInt()
    @IsOptional()
    semester?: number;

    @IsString()
    @IsOptional()
    departmentId?: string;

    @IsString()
    @IsOptional()
    subjectId?: string;
}
