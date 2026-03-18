import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min } from 'class-validator';

export enum CourseType {
  UNDERGRADUATE = 'UNDERGRADUATE',
  POSTGRADUATE = 'POSTGRADUATE',
  DIPLOMA = 'DIPLOMA',
  PUC = 'PUC',
  SCHOOL = 'SCHOOL',
}

export enum CourseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(CourseType)
  type?: CourseType;

  @IsString()
  @IsNotEmpty()
  duration: string;

  @IsInt()
  @Min(1)
  totalSemesters: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  credits?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxEnrollment?: number;

  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @IsString()
  @IsNotEmpty()
  departmentId: string;
}
