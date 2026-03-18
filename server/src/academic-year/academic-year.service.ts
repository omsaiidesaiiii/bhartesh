import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';

@Injectable()
export class AcademicYearService {
    constructor(private prisma: PrismaService) { }

    async create(createAcademicYearDto: CreateAcademicYearDto) {
        const existing = await this.prisma.academicYear.findUnique({
            where: { name: createAcademicYearDto.name },
        });

        if (existing) {
            throw new ConflictException('Academic year with this name already exists');
        }

        return this.prisma.academicYear.create({
            data: {
                ...createAcademicYearDto,
                startDate: new Date(createAcademicYearDto.startDate),
                endDate: new Date(createAcademicYearDto.endDate),
            },
        });
    }

    async findAll() {
        return this.prisma.academicYear.findMany({
            orderBy: { startDate: 'desc' },
        });
    }

    async findActive() {
        return this.prisma.academicYear.findFirst({
            where: { status: 'ACTIVE' }
        });
    }
}
