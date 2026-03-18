import { Controller, Get, Post, Body, UseGuards, Param, Delete, NotFoundException } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() createEventDto: CreateEventDto) {
        return this.eventsService.create(createEventDto);
    }

    @Get()
    findAll() {
        return this.eventsService.findAll();
    }

    @Get('upcoming')
    findUpcoming() {
        return this.eventsService.findUpcoming();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const event = await this.eventsService.findOne(id);
        if (!event) {
            throw new NotFoundException('Event not found');
        }
        return event;
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async delete(@Param('id') id: string) {
        const event = await this.eventsService.findOne(id);
        if (!event) {
            throw new NotFoundException('Event not found');
        }
        await this.eventsService.delete(id);
        return { success: true, message: 'Event deleted successfully' };
    }
}
