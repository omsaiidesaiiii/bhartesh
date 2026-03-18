import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    Get,
    Param,
    Res,
    NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync } from 'fs';
import type { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { EventsService } from './events.service';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) {}

    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/events',
                filename: (req, file, callback) => {
                    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
                    callback(null, uniqueName);
                },
            }),
            limits: {
                fileSize: MAX_FILE_SIZE,
            },
            fileFilter: (req, file, callback) => {
                if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
                    return callback(
                        new BadRequestException('Only PNG, JPG, JPEG, GIF, and WEBP files are allowed'),
                        false,
                    );
                }
                callback(null, true);
            },
        }),
    )
    uploadEventAttachment(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const url = this.eventsService.getFileUrl(file.filename);
        return {
            success: true,
            url,
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
        };
    }

    @Get('attachments/:filename')
    getAttachment(@Param('filename') filename: string, @Res() res: Response) {
        const filePath = join(process.cwd(), 'uploads', 'events', filename);

        if (!existsSync(filePath)) {
            throw new NotFoundException('Attachment not found');
        }

        return res.sendFile(filePath);
    }
}
