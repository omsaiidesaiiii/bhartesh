import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Gender } from './create-profile.dto';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  regno?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsDateString()
  DOB?: string;
}