import { IsString, IsOptional, IsEnum } from 'class-validator';
import { DepartmentStatus } from './create-department.dto';

export class UpdateDepartmentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(DepartmentStatus)
  status?: DepartmentStatus;
}
