import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignHodDto } from './dto/assign-hod.dto';

@Injectable()
export class HodService {
    constructor(private prisma: PrismaService) { }

    async assignHod(dto: AssignHodDto) {
        // Check if staff exists and is valid
        const staff = await this.prisma.user.findUnique({
            where: { id: dto.staffId },
        });

        if (!staff || staff.role !== 'STAFF') {
            throw new BadRequestException('User is not a staff member');
        }

        // Check if department exists
        const department = await this.prisma.department.findUnique({
            where: { id: dto.departmentId },
        });

        if (!department) {
            throw new NotFoundException('Department not found');
        }

        // Check if department already has an HOD (schema enforces uniqueness, but good to check for friendly error)
        const existingDeptHod = await this.prisma.departmentHOD.findUnique({
            where: { departmentId: dto.departmentId },
        });

        if (existingDeptHod) {
            throw new BadRequestException('Department already has an HOD assigned');
        }

        // Check if staff is already HOD of another department
        const existingStaffHod = await this.prisma.departmentHOD.findUnique({
            where: { staffId: dto.staffId },
        });

        if (existingStaffHod) {
            throw new BadRequestException('This staff member is already an HOD of a department');
        }

        return this.prisma.departmentHOD.create({
            data: {
                departmentId: dto.departmentId,
                staffId: dto.staffId,
            },
            include: {
                department: true,
                staff: true,
            },
        });
    }

    async getHod(departmentId: string) {
        const hod = await this.prisma.departmentHOD.findUnique({
            where: { departmentId },
            include: {
                staff: true,
                department: true,
            },
        });

        if (!hod) {
            throw new NotFoundException('No HOD assigned for this department');
        }

        return hod;
    }

    async findAll() {
        return this.prisma.departmentHOD.findMany({
            include: {
                staff: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                department: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });
    }
}
