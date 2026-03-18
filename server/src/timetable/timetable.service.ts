import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';

@Injectable()
export class TimetableService {
    constructor(private prisma: PrismaService) { }

    async createEntry(dto: CreateTimetableDto) {
        const start = new Date(dto.startTime);
        const end = new Date(dto.endTime);

        if (start >= end) {
            throw new BadRequestException('Start time must be before end time');
        }

        // Clash detection
        const clash = await this.prisma.timeTable.findFirst({
            where: {
                staffId: dto.staffId,
                dayOfWeek: dto.dayOfWeek,
                OR: [
                    {
                        startTime: { lt: end },
                        endTime: { gt: start },
                    },
                ],
            },
        });

        if (clash) {
            throw new BadRequestException('Timetable clash detected for this staff member');
        }

        // Also check for room clash if room is specified?
        // Optional requirement but good to have.
        if (dto.room) {
            const roomClash = await this.prisma.timeTable.findFirst({
                where: {
                    room: dto.room,
                    dayOfWeek: dto.dayOfWeek,
                    OR: [
                        {
                            startTime: { lt: end },
                            endTime: { gt: start },
                        },
                    ],
                }
            });

            if (roomClash) {
                throw new BadRequestException('Room is already booked at this time');
            }
        }

        return this.prisma.timeTable.create({
            data: {
                staffId: dto.staffId,
                subjectId: dto.subjectId,
                departmentId: dto.departmentId,
                dayOfWeek: dto.dayOfWeek,
                startTime: start,
                endTime: end,
                room: dto.room,
                semester: dto.semester,
                section: dto.section,
            },
        });
    }

    async getStaffTimetable(staffId: string) {
        return this.prisma.timeTable.findMany({
            where: { staffId },
            include: {
                subject: true,
                department: true,
            },
            orderBy: [
                { dayOfWeek: 'asc' }, // Note: Enum sort might not be chronological (M, T, W...). 
                { startTime: 'asc' },
            ],
        });
    }

    async getDepartmentTimetable(departmentId: string) {
        return this.prisma.timeTable.findMany({
            where: { departmentId },
            include: {
                subject: true,
                staff: {
                    select: {
                        name: true,
                    }
                },
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' },
            ],
        });
    }

    async updateEntry(id: string, dto: Partial<CreateTimetableDto>) {
        const existing = await this.prisma.timeTable.findUnique({ where: { id } });
        if (!existing) throw new BadRequestException('Entry not found');

        const start = dto.startTime ? new Date(dto.startTime) : existing.startTime;
        const end = dto.endTime ? new Date(dto.endTime) : existing.endTime;

        if (start >= end) {
            throw new BadRequestException('Start time must be before end time');
        }

        const staffId = dto.staffId || existing.staffId;
        const dayOfWeek = dto.dayOfWeek || existing.dayOfWeek;

        // Clash detection (excluding self)
        const clash = await this.prisma.timeTable.findFirst({
            where: {
                id: { not: id },
                staffId,
                dayOfWeek,
                OR: [
                    {
                        startTime: { lt: end },
                        endTime: { gt: start },
                    },
                ],
            },
        });

        if (clash) {
            throw new BadRequestException('Timetable clash detected for this staff member');
        }

        if (dto.room || existing.room) {
            const room = dto.room || existing.room;
            const roomClash = await this.prisma.timeTable.findFirst({
                where: {
                    id: { not: id },
                    room,
                    dayOfWeek,
                    OR: [
                        {
                            startTime: { lt: end },
                            endTime: { gt: start },
                        },
                    ],
                }
            });

            if (roomClash) {
                throw new BadRequestException('Room is already booked at this time');
            }
        }

        return this.prisma.timeTable.update({
            where: { id },
            data: {
                ...dto,
                startTime: dto.startTime ? start : undefined,
                endTime: dto.endTime ? end : undefined,
            },
        });
    }

    async deleteEntry(id: string) {
        // Delete related AttendanceSession records first (and their AttendanceRecords via cascade)
        // Then delete the TimeTable entry
        return this.prisma.$transaction(async (tx) => {
            // First, delete all AttendanceSessions that reference this timetable
            await tx.attendanceSession.deleteMany({
                where: { timetableId: id }
            });

            // Then delete the timetable entry
            return tx.timeTable.delete({ where: { id } });
        });
    }
}
