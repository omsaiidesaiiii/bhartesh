import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertInternalMarkDto } from './dto/internal-mark.dto';
import { UpsertExternalMarkDto } from './dto/external-mark.dto';

@Injectable()
export class InternalMarksService {
    constructor(private prisma: PrismaService) { }

    async upsertMark(dto: UpsertInternalMarkDto) {
        const assessmentType = dto.assessmentType ?? 'IA1';
        return this.prisma.internalMark.upsert({
            where: {
                studentId_subjectId_semester_assessmentType: {
                    studentId: dto.studentId,
                    subjectId: dto.subjectId,
                    semester: dto.semester,
                    assessmentType: assessmentType as any,
                },
            },
            update: {
                marks: dto.marks,
                maxMarks: dto.maxMarks,
                remarks: dto.remarks,
            },
            create: {
                studentId: dto.studentId,
                subjectId: dto.subjectId,
                semester: dto.semester,
                assessmentType: assessmentType as any,
                marks: dto.marks,
                maxMarks: dto.maxMarks ?? 20,
                remarks: dto.remarks,
            },
            include: {
                subject: true,
            }
        });
    }

    async getStudentMarks(studentId: string, semester?: number) {
        return this.prisma.internalMark.findMany({
            where: {
                studentId,
                ...(semester ? { semester } : {}),
            },
            include: {
                subject: true,
            },
            orderBy: {
                subject: {
                    name: 'asc',
                },
            },
        });
    }

    async getSubjectMarks(subjectId: string, semester: number) {
        return this.prisma.internalMark.findMany({
            where: {
                subjectId,
                semester,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profile: {
                            select: {
                                regno: true,
                                section: true,
                            }
                        }
                    }
                }
            }
        });
    }

    // External Marks Methods
    async upsertExternalMark(dto: UpsertExternalMarkDto) {
        return this.prisma.externalMark.upsert({
            where: {
                studentId_subjectId_semester: {
                    studentId: dto.studentId,
                    subjectId: dto.subjectId,
                    semester: dto.semester,
                },
            },
            update: {
                marks: dto.marks,
                maxMarks: dto.maxMarks,
                remarks: dto.remarks,
            },
            create: {
                studentId: dto.studentId,
                subjectId: dto.subjectId,
                semester: dto.semester,
                marks: dto.marks,
                maxMarks: dto.maxMarks ?? 80,
                remarks: dto.remarks,
            },
        });
    }

    // Result Aggregation logic
    async getStudentResults(studentId: string, semester: number) {
        // First get the student to find their department
        const student = await this.prisma.user.findUnique({
            where: { id: studentId },
            include: { profile: true }
        });

        if (!student || !student.departmentId) {
            return [];
        }

        const [internals, externals, subjects] = await Promise.all([
            this.prisma.internalMark.findMany({
                where: { studentId, semester },
                include: { subject: true }
            }),
            this.prisma.externalMark.findMany({
                where: { studentId, semester }
            }),
            this.prisma.subject.findMany({
                where: {
                    departmentId: student.departmentId,
                    semester
                }
            })
        ]);

        return subjects.map(subject => {
            const subjectInternals = internals.filter(i => i.subjectId === subject.id);
            const external = externals.find(e => e.subjectId === subject.id);

            // Calculate internal average (user mentioned can be 2, 3, 4)
            const internalTotal = subjectInternals.reduce((acc, curr) => acc + curr.marks, 0);
            const internalMaxTotal = subjectInternals.reduce((acc, curr) => acc + curr.maxMarks, 0);

            // Normalize internal marks to 20 if needed, or just sum them
            // Conventionally, it might be average or best of. 
            // Here we'll sum and provide the max possible.

            const totalMarks = internalTotal + (external?.marks || 0);
            const totalMax = internalMaxTotal + (external?.maxMarks || 80);

            // Grade calculation (Basic example: 90+ = S, 80+ = A, 70+ = B, etc.)
            const percentage = (totalMarks / totalMax) * 100;
            let grade = 'F';
            let gradePoint = 0;

            if (percentage >= 90) { grade = 'S'; gradePoint = 10; }
            else if (percentage >= 80) { grade = 'A'; gradePoint = 9; }
            else if (percentage >= 70) { grade = 'B'; gradePoint = 8; }
            else if (percentage >= 60) { grade = 'C'; gradePoint = 7; }
            else if (percentage >= 50) { grade = 'D'; gradePoint = 6; }
            else if (percentage >= 40) { grade = 'E'; gradePoint = 5; }

            return {
                subject,
                internals: subjectInternals,
                external,
                totalMarks,
                totalMax,
                percentage,
                grade,
                gradePoint
            };
        });
    }
}
