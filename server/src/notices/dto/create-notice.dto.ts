import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NoticeAudience } from '@prisma/client';

export class CreateNoticeDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsEnum(NoticeAudience)
    @IsNotEmpty()
    audience: NoticeAudience;

    @IsBoolean()
    @IsOptional()
    pinned?: boolean;
}

export class UpdateNoticeDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    content?: string;

    @IsEnum(NoticeAudience)
    @IsOptional()
    audience?: NoticeAudience;

    @IsBoolean()
    @IsOptional()
    pinned?: boolean;
}
