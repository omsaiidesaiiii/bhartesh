import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto, UpdateProfileDto } from './dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) { }

  /**
   * Create a new profile
   */
  async create(createProfileDto: CreateProfileDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: createProfileDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if profile already exists for this user
    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId: createProfileDto.userId },
    });

    if (existingProfile) {
      throw new ConflictException('Profile already exists for this user');
    }

    // Check if regno is unique if provided
    if (createProfileDto.regno) {
      const existingRegno = await this.prisma.profile.findUnique({
        where: { regno: createProfileDto.regno },
      });

      if (existingRegno) {
        throw new ConflictException('Registration number already exists');
      }
    }

    return this.prisma.profile.create({
      data: createProfileDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
          },
        },
      },
    });
  }

  /**
   * Get all profiles with optional filters
   */
  async findAll(userId?: string, regno?: string) {
    const where: Record<string, unknown> = {};

    if (userId) {
      where.userId = userId;
    }

    if (regno) {
      where.regno = regno;
    }

    return this.prisma.profile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single profile by ID
   */
  async findOne(id: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  /**
   * Get profile by user ID
   */
  async findByUserId(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found for this user');
    }

    return profile;
  }

  /**
   * Update a profile
   */
  async update(id: string, updateProfileDto: UpdateProfileDto) {
    // Check if profile exists
    const existingProfile = await this.prisma.profile.findUnique({
      where: { id },
    });

    if (!existingProfile) {
      throw new NotFoundException('Profile not found');
    }

    // Check regno uniqueness if being updated
    if (updateProfileDto.regno && updateProfileDto.regno !== existingProfile.regno) {
      const existingRegno = await this.prisma.profile.findUnique({
        where: { regno: updateProfileDto.regno },
      });

      if (existingRegno) {
        throw new ConflictException('Registration number already exists');
      }
    }

    return this.prisma.profile.update({
      where: { id },
      data: updateProfileDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Delete a profile
   */
  async remove(id: string) {
    // Check if profile exists
    const existingProfile = await this.prisma.profile.findUnique({
      where: { id },
    });

    if (!existingProfile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.profile.delete({
      where: { id },
    });
  }

  /**
   * Get profile by user ID with courses (for students)
   */
  async findByUserIdWithCourses(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found for this user');
    }

    // Get enrolled courses for students
    let courses: any[] = [];
    if (profile.user.role === 'STUDENT') {
      const studentCourses = await this.prisma.studentCourse.findMany({
        where: { studentId: userId },
        include: {
          course: {
            include: {
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
      courses = studentCourses.map(sc => sc.course);
    }

    return {
      ...profile,
      courses,
    };
  }

  /**
   * Update profile by user ID (useful for users updating their own profile)
   */
  async updateByUserId(userId: string, updateProfileDto: UpdateProfileDto) {
    // Check if profile exists for this user
    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      throw new NotFoundException('Profile not found for this user');
    }

    // Check regno uniqueness if being updated
    if (updateProfileDto.regno && updateProfileDto.regno !== existingProfile.regno) {
      const existingRegno = await this.prisma.profile.findUnique({
        where: { regno: updateProfileDto.regno },
      });

      if (existingRegno) {
        throw new ConflictException('Registration number already exists');
      }
    }

    return this.prisma.profile.update({
      where: { userId },
      data: updateProfileDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }
}
