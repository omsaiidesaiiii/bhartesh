import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

/**
 * DTO for Admin/Staff login with credentials
 */
export class CredentialLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

/**
 * DTO for Student login with Firebase token
 */
export class FirebaseLoginDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;
}

/**
 * DTO for creating staff by admin
 */
export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  departmentId?: string;
}

/**
 * Auth response type
 */
export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    username?: string;
    role: string;
    isActive: boolean;
    profileImageUrl?: string;
  };
}
