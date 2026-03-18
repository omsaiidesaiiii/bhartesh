import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
    constructor(private prisma: PrismaService) { }

    async create(createEventDto: CreateEventDto) {
        return this.prisma.academicEvent.create({
            data: {
                title: createEventDto.title,
                description: createEventDto.description,
                date: new Date(createEventDto.date),
                type: createEventDto.type,
                attachmentUrl: createEventDto.attachmentUrl,
            },
        });
    }

    async findAll() {
        return this.prisma.academicEvent.findMany({
            orderBy: { date: 'asc' },
        });
    }

    async findUpcoming() {
        return this.prisma.academicEvent.findMany({
            orderBy: { date: 'asc' },
            where: {
                date: {
                    gte: new Date(),
                }
            }
        });
    }

    async findOne(id: string) {
        return this.prisma.academicEvent.findUnique({
            where: { id },
        });
    }

    async delete(id: string) {
        return this.prisma.academicEvent.delete({
            where: { id },
        });
    }
}
