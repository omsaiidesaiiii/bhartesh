import { Injectable } from '@nestjs/common';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class EventsService {
    private readonly cdnBaseUrl: string;

    constructor() {
        this.cdnBaseUrl = process.env.CDN_BASE_URL || 'http://localhost:3001';
    }

    getFileUrl(filename: string): string {
        return `${this.cdnBaseUrl}/events/attachments/${filename}`;
    }

    deleteFile(filename: string): boolean {
        const filePath = join(process.cwd(), 'uploads', 'events', filename);
        if (existsSync(filePath)) {
            unlinkSync(filePath);
            return true;
        }
        return false;
    }
}
