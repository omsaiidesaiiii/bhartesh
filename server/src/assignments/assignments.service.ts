import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto, UpdateAssignmentDto } from './dto/create-assignment.dto';
import { SubmissionStatus } from '@prisma/client';

@Injectable()
export class AssignmentsService {
    constructor(private prisma: PrismaService) { }

    async create(createAssignmentDto: CreateAssignmentDto, authorId: string) {
        const { subjectId, ...rest } = createAssignmentDto;
        return this.prisma.assignment.create({
            data: {
                ...rest,
                subjectId: subjectId || null,
                dueDate: new Date(createAssignmentDto.dueDate),
                authorId,
            },
        });
    }

    async findAll(filters: { semester?: number; departmentId?: string; authorId?: string }) {
        return this.prisma.assignment.findMany({
            where: filters,
            include: {
                author: {
                    select: {
                        name: true,
                        role: true,
                    },
                },
                subject: {
                    select: {
                        name: true,
                        code: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string) {
        const assignment = await this.prisma.assignment.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        name: true,
                    },
                },
                subject: {
                    select: {
                        name: true,
                    },
                },
                department: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!assignment) {
            throw new NotFoundException(`Assignment with ID ${id} not found`);
        }

        return assignment;
    }

    async update(id: string, updateAssignmentDto: UpdateAssignmentDto) {
        const data: any = { ...updateAssignmentDto };
        if (updateAssignmentDto.dueDate) {
            data.dueDate = new Date(updateAssignmentDto.dueDate);
        }

        return this.prisma.assignment.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.assignment.delete({
            where: { id },
        });
    }

    async getSubmissions(assignmentId: string) {
        const assignment = await this.findOne(assignmentId);

        // Get all students in this department and semester
        const students = await this.prisma.user.findMany({
            where: {
                role: 'STUDENT',
                departmentId: assignment.departmentId,
                profile: {
                    semester: assignment.semester,
                },
            },
            include: {
                studentSubmissions: {
                    where: {
                        assignmentId,
                    },
                },
            },
        });

        return students.map(student => ({
            id: student.id,
            name: student.name,
            email: student.email,
            submission: student.studentSubmissions[0] || { status: SubmissionStatus.PENDING },
        }));
    }

    async markAsSubmitted(assignmentId: string, studentId: string, markedById: string) {
        return this.prisma.assignmentSubmission.upsert({
            where: {
                assignmentId_studentId: {
                    assignmentId,
                    studentId,
                },
            },
            update: {
                status: SubmissionStatus.SUBMITTED,
                submittedAt: new Date(),
                markedById,
            },
            create: {
                assignmentId,
                studentId,
                status: SubmissionStatus.SUBMITTED,
                submittedAt: new Date(),
                markedById,
            },
        });
    }

    async getStudentAssignments(studentId: string) {
        const student = await this.prisma.user.findUnique({
            where: { id: studentId },
            include: {
                profile: true,
            },
        });

        if (!student || !student.profile) {
            return [];
        }

        const assignments = await this.prisma.assignment.findMany({
            where: {
                semester: student.profile.semester || 0,
                departmentId: student.departmentId || '',
            },
            include: {
                author: {
                    select: {
                        name: true,
                    },
                },
                subject: {
                    select: {
                        name: true,
                    },
                },
                submissions: {
                    where: {
                        studentId,
                    },
                },
            },
            orderBy: {
                dueDate: 'asc',
            },
        });

        return assignments.map(a => ({
            ...a,
            status: a.submissions[0]?.status || SubmissionStatus.PENDING,
            submittedAt: a.submissions[0]?.submittedAt,
        }));
    }
}
