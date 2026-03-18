import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from './dto';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new course
   */
  async create(createCourseDto: CreateCourseDto) {
    // Check if course code already exists
    const existing = await this.prisma.course.findUnique({
      where: { code: createCourseDto.code },
    });

    if (existing) {
      throw new ConflictException('Course with this code already exists');
    }

    // Verify department exists
    const department = await this.prisma.department.findUnique({
      where: { id: createCourseDto.departmentId },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return this.prisma.course.create({
      data: createCourseDto,
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Get all courses with optional filters
   */
  async findAll(departmentId?: string, status?: string, type?: string) {
    const where: Record<string, unknown> = {};

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    return this.prisma.course.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single course by ID
   */
  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  /**
   * Update a course
   */
  async update(id: string, updateCourseDto: UpdateCourseDto) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    // Check for code conflict if code is being updated
    if (updateCourseDto.code && updateCourseDto.code !== course.code) {
      const existing = await this.prisma.course.findUnique({
        where: { code: updateCourseDto.code },
      });

      if (existing) {
        throw new ConflictException('Course with this code already exists');
      }
    }

    // Verify department exists if departmentId is being updated
    if (updateCourseDto.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: updateCourseDto.departmentId },
      });

      if (!department) {
        throw new NotFoundException('Department not found');
      }
    }

    return this.prisma.course.update({
      where: { id },
      data: updateCourseDto,
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Delete a course
   */
  async remove(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { enrollments: true },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    if (course.enrollments.length > 0) {
      throw new ConflictException(
        'Cannot delete course with enrolled students. Please remove enrollments first.',
      );
    }

    return this.prisma.course.delete({
      where: { id },
    });
  }

  /**
   * Get courses by department
   */
  async findByDepartment(departmentId: string) {
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return this.prisma.course.findMany({
      where: { departmentId },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: { title: 'asc' },
    });
  }
}
