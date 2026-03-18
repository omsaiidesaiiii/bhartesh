import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class SetupService {
  constructor(private prisma: PrismaService) { }

  // ==================== DEPARTMENT CRUD ====================

  /**
   * Create a new department
   */
  async createDepartment(createDepartmentDto: CreateDepartmentDto) {
    const existing = await this.prisma.department.findUnique({
      where: { name: createDepartmentDto.name },
    });

    if (existing) {
      throw new ConflictException('Department with this name already exists');
    }

    return this.prisma.department.create({
      data: createDepartmentDto,
    });
  }

  /**
   * Get all departments
   */
  async findAllDepartments() {
    return this.prisma.department.findMany({
      include: {
        hod: {
          include: {
            staff: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            users: true,
            subjects: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single department by ID
   */
  async findDepartmentById(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  /**
   * Update a department
   */
  async updateDepartment(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    // Check for name conflict if name is being updated
    if (updateDepartmentDto.name && updateDepartmentDto.name !== department.name) {
      const existing = await this.prisma.department.findUnique({
        where: { name: updateDepartmentDto.name },
      });

      if (existing) {
        throw new ConflictException('Department with this name already exists');
      }
    }

    return this.prisma.department.update({
      where: { id },
      data: updateDepartmentDto,
    });
  }

  /**
   * Delete a department
   */
  async deleteDepartment(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: { users: true },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    if (department.users.length > 0) {
      throw new ConflictException(
        'Cannot delete department with associated users. Please reassign or remove users first.',
      );
    }

    return this.prisma.department.delete({
      where: { id },
    });
  }
}
