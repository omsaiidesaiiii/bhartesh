import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findAll(page: number = 1, limit: number = 10, role?: string, departmentId?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {};
    if (role) where.role = role.toUpperCase() as any; // Cast to any because role is enum in Prisma but string here
    if (departmentId) where.departmentId = departmentId;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          phone: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          department: {
            select: {
              id: true,
              name: true
            }
          },
          staffSubjects: {
            select: {
              subject: {
                select: {
                  id: true,
                  name: true,
                  code: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStaffStats() {
    const [totalStaff, activeStaff, inactiveStaff, departments] = await Promise.all([
      this.prisma.user.count({ where: { role: 'STAFF' } }),
      this.prisma.user.count({ where: { role: 'STAFF', isActive: true } }),
      this.prisma.user.count({ where: { role: 'STAFF', isActive: false } }),
      this.prisma.department.count({ where: { status: 'ACTIVE' } }),
    ]);

    // For now, we'll use placeholder values for workload
    // This would need additional models/tables in a real implementation
    const avgWorkload = 18; // Placeholder in hours

    return {
      totalStaff,
      activeStaff,
      inactiveStaff,
      departments,
      avgWorkload,
    };
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        department: true,
        staffSubjects: {
          include: {
            subject: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByFirebaseUid(firebaseUid: string) {
    return this.prisma.user.findUnique({
      where: { firebaseUid },
    });
  }

  async findByIdWithRoles(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  /**
   * Create a student via Firebase (Google Login)
   * Students are auto-created on first login
   */
  async createStudent(data: {
    firebaseUid: string;
    email: string;
    name: string;
    profileImageUrl?: string;
  }) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    return this.prisma.user.create({
      data: {
        firebaseUid: data.firebaseUid,
        email: data.email,
        name: data.name,
        profileImageUrl: data.profileImageUrl,
        role: 'STUDENT',
        isVerified: true, // Firebase already verified email
        isActive: true,
      },
    });
  }

  /**
   * Create a staff member (by Admin)
   */
  async createStaff(data: {
    name: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
    departmentId?: string;
    createdById?: string;
  }): Promise<User> {
    console.log('DEBUG: Creating staff with data:', JSON.stringify({ ...data, password: '[REDACTED]' }, null, 2));
    const { username, email } = data;

    // Check for existing user
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    });

    if (existing) {
      if (existing.username === username) {
        throw new ConflictException('Username already exists');
      }
      if (existing.email === email) {
        throw new ConflictException('Email already exists');
      }
    }

    return this.prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: 'STAFF',
        isActive: true,
        createdById: data.createdById,
        departmentId: data.departmentId,
      },
    });
  }

  /**
   * Deactivate/Activate a user
   */
  async setActiveStatus(userId: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
  }

  /**
   * Delete a user (soft delete by deactivating, or hard delete)
   */
  async deleteUser(userId: string) {
    // Soft delete - just deactivate the user
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
  }

  async storeFcmToken(userId: string, token: string, deviceType: string = 'WEB') {
    // First, check if token already exists for this user and device
    const existingToken = await this.prisma.userTokens.findFirst({
      where: {
        userId,
        deviceType: deviceType as any,
      },
    });

    if (existingToken) {
      // Update existing token
      return this.prisma.userTokens.update({
        where: { id: existingToken.id },
        data: { token, lastUsed: new Date() },
      });
    } else {
      // Create new token
      return this.prisma.userTokens.create({
        data: {
          userId,
          token,
          deviceType: deviceType as any,
        },
      });
    }
  }

  // Legacy method - kept for compatibility
  async create(data: { name: string; username: string; email: string; password: string; phone?: string }) {
    const { username, email } = data;

    // Pre-check to provide clear errors and avoid Prisma constraint failures
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    });

    if (existing) {
      if (existing.username === username) {
        throw new ConflictException('Username already exists');
      }
      if (existing.email === email) {
        throw new ConflictException('Email already exists');
      }
      // Fallback
      throw new ConflictException('User already exists');
    }

    try {
      return await this.prisma.user.create({
        data: {
          ...data,
          role: 'STAFF', // Default to STAFF for manual creation
        },
      });
    } catch (err: unknown) {
      // Handle Prisma unique constraint error as a conflict
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        const target = (err.meta?.target as string[]) || [];
        if (target.includes('username')) {
          throw new ConflictException('Username already exists');
        }
        if (target.includes('email')) {
          throw new ConflictException('Email already exists');
        }
        throw new ConflictException('Duplicate value for unique field');
      }
      // Re-throw other errors as bad requests
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      throw new BadRequestException(errorMessage);
    }
  }

  async getStaffWorkload() {
    const staffMembers = await this.prisma.user.findMany({
      where: { role: 'STAFF' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        _count: {
          select: {
            staffSubjects: true,
            timetables: true,
          },
        },
        timetables: {
          select: {
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    const result = staffMembers.map((staff) => {
      let totalWeeklyHours = 0;
      staff.timetables.forEach((entry) => {
        const duration = (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / (1000 * 60 * 60);
        totalWeeklyHours += duration;
      });

      return {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        isActive: staff.isActive,
        subjectsCount: staff._count.staffSubjects,
        weeklyClassesCount: staff._count.timetables,
        weeklyHours: Math.round(totalWeeklyHours * 10) / 10,
      };
    });

    console.log('Workload result:', JSON.stringify(result, null, 2));
    return result;
  }
}

