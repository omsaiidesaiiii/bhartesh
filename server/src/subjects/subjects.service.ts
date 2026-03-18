import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';

@Injectable()
export class SubjectsService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateSubjectDto) {
        return this.prisma.subject.create({
            data: dto,
        });
    }

    async getByDepartment(departmentId: string, semester?: number) {
        return this.prisma.subject.findMany({
            where: {
                departmentId,
                ...(semester ? { semester } : {}),
            },
            include: {
                department: true,
                teachers: {
                    include: {
                        staff: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                }
            },
        });
    }

    async getAll() {
        return this.prisma.subject.findMany({
            include: {
                department: true,
            },
        });
    }
}
