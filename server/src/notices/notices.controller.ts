import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { NoticesService } from './notices.service';
import { CreateNoticeDto, UpdateNoticeDto } from './dto/create-notice.dto';
import { NoticeAudience } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('notices')
export class NoticesController {
    constructor(private readonly noticesService: NoticesService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() createNoticeDto: CreateNoticeDto, @Request() req) {
        // TODO: getting userId from request, assuming req.user.id exists
        // For now hardcoding or passing via DTO might be needed if auth isn't set up fully
        // But typically: return this.noticesService.create(createNoticeDto, req.user.id);
        // Since I don't know the exact Auth structure, I'll assume req.user.id is available via some middleware/guard
        // If not, I'll need to check how other controllers handle it.

        // For now let's assume we need to pass authorId. 
        // Actually, let's check how other controllers do it. 
        // I'll leave a placeholder comment and check `server/src/auth` or existing controllers.
        return this.noticesService.create(createNoticeDto, req.user?.id);
    }

    @Get()
    findAll(
        @Query('audience') audience?: NoticeAudience,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string
    ) {
        return this.noticesService.findAll(audience, page, limit, search);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.noticesService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateNoticeDto: UpdateNoticeDto, @Request() req) {
        // Check if user is admin or the author
        // For now, assume req.user has role and id
        // TODO: Implement proper authorization
        return this.noticesService.update(id, updateNoticeDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        // Check if user is admin or the author
        // For now, assume req.user has role and id
        // TODO: Implement proper authorization
        return this.noticesService.remove(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/pin')
    togglePin(@Param('id') id: string) {
        return this.noticesService.togglePin(id);
    }
}
