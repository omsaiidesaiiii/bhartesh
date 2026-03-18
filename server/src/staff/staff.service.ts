import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignSubjectDto } from './dto/assign-subject.dto';

@Injectable()
export class StaffService {
    constructor(private prisma: PrismaService) { }

    async assignSubject(staffId: string, dto: AssignSubjectDto) {
        // Verify staff exists and is a STAFF
        const staff = await this.prisma.user.findUnique({
            where: { id: staffId },
        });

        if (!staff || staff.role !== 'STAFF') {
            throw new BadRequestException('User is not a staff member');
        }

        // Verify subject exists
        const subject = await this.prisma.subject.findUnique({
            where: { id: dto.subjectId },
        });

        if (!subject) {
            throw new NotFoundException('Subject not found');
        }

        // Check if already assigned
        const existing = await this.prisma.staffSubject.findUnique({
            where: {
                staffId_subjectId: {
                    staffId,
                    subjectId: dto.subjectId,
                },
            },
        });

        if (existing) {
            throw new BadRequestException('Subject already assigned to this staff');
        }

        return this.prisma.staffSubject.create({
            data: {
                staffId,
                subjectId: dto.subjectId,
            },
            include: {
                subject: true,
            },
        });
    }

    async getStaffSubjects(staffId: string) {
        return this.prisma.staffSubject.findMany({
            where: { staffId },
            include: {
                subject: {
                    include: { department: true },
                },
            },
        });
    }
}
