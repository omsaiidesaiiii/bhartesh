import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubjectDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty()
    @IsInt()
    @IsOptional()
    credits?: number;

    @ApiProperty()
    @IsInt()
    semester: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    departmentId: string;
}
