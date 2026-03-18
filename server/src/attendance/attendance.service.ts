import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceSessionStatus, AttendanceStatus, DayOfWeek } from '@prisma/client';

@Injectable()
export class AttendanceService {
    constructor(private prisma: PrismaService) { }

    async getTodaySessionsForStaff(staffId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dayOfWeek = this.getEnumDayOfWeek(today.getDay());

        // 1. Get timetable entries for this staff member for today's day of week
        const timetableEntries = await this.prisma.timeTable.findMany({
            where: {
                staffId,
                dayOfWeek,
            },
            include: {
                subject: true,
                department: true,
            },
        });

        // 2. Ensure AttendanceSession records exist for each timetable entry
        const sessions = await Promise.all(
            timetableEntries.map(async (entry) => {
                let session = await this.prisma.attendanceSession.findUnique({
                    where: {
                        date_timetableId: {
                            date: today,
                            timetableId: entry.id,
                        },
                    },
                });

                if (!session) {
                    session = await this.prisma.attendanceSession.create({
                        data: {
                            date: today,
                            timetableId: entry.id,
                            staffId: entry.staffId,
                            subjectId: entry.subjectId,
                            departmentId: entry.departmentId,
                            semester: entry.semester || 0,
                            section: entry.section,
                            startTime: entry.startTime, // Keeping original slot times, but could be adjusted to current date
                            endTime: entry.endTime,
                            status: AttendanceSessionStatus.PENDING,
                        },
                    });
                }

                return {
                    ...session,
                    timetable: entry,
                };
            }),
        );

        return sessions;
    }

    async getStudentsForSession(sessionId: string) {
        const session = await this.prisma.attendanceSession.findUnique({
            where: { id: sessionId },
            include: {
                timetable: true,
            },
        });

        if (!session) {
            throw new NotFoundException('Attendance session not found');
        }

        // Fetch students enrolled in the course and department that match the session's semester and section
        // Note: This logic depends on how StudentCourse and Profile are linked.
        // In our schema, Profile has semester and section. User has departmentId.

        return this.prisma.user.findMany({
            where: {
                role: 'STUDENT',
                departmentId: session.departmentId,
                isActive: true,
                profile: {
                    semester: session.semester,
                    section: session.section,
                },
            },
            include: {
                profile: true,
            },
        });
    }

    async markAttendance(sessionId: string, records: { studentId: string; status: AttendanceStatus; remarks?: string }[]) {
        const session = await this.prisma.attendanceSession.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            throw new NotFoundException('Attendance session not found');
        }

        if (session.isLocked) {
            throw new BadRequestException('This attendance session is locked and cannot be modified');
        }

        // Bulk upsert records
        await Promise.all(
            records.map((record) =>
                this.prisma.attendanceRecord.upsert({
                    where: {
                        sessionId_studentId: {
                            sessionId,
                            studentId: record.studentId,
                        },
                    },
                    update: {
                        status: record.status,
                        remarks: record.remarks,
                    },
                    create: {
                        sessionId,
                        studentId: record.studentId,
                        status: record.status,
                        remarks: record.remarks,
                    },
                }),
            ),
        );

        // Update session status
        await this.prisma.attendanceSession.update({
            where: { id: sessionId },
            data: {
                status: AttendanceSessionStatus.COMPLETED,
                // isLocked: true, // Optional: Lock automatically after marking?
            },
        });

        return { message: 'Attendance marked successfully' };
    }

    async lockSession(sessionId: string) {
        return this.prisma.attendanceSession.update({
            where: { id: sessionId },
            data: { isLocked: true },
        });
    }

    async cancelSession(sessionId: string) {
        const session = await this.prisma.attendanceSession.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            throw new NotFoundException('Attendance session not found');
        }

        if (session.isLocked) {
            throw new BadRequestException('Locked sessions cannot be cancelled');
        }

        return this.prisma.attendanceSession.update({
            where: { id: sessionId },
            data: {
                status: AttendanceSessionStatus.CANCELLED,
                isLocked: true // Lock it so it can't be marked later
            },
        });
    }

    async getStudentAttendanceReport(studentId: string) {
        const records = await this.prisma.attendanceRecord.findMany({
            where: {
                studentId,
                session: {
                    status: AttendanceSessionStatus.COMPLETED // Only count completed sessions
                }
            },
            include: {
                session: {
                    include: {
                        subject: true,
                        staff: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: { session: { date: 'desc' } },
        });

        const totalRecords = records.length;
        const presentRecords = records.filter(r => r.status === AttendanceStatus.PRESENT).length;
        const percentage = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0;

        return {
            totalSessions: totalRecords,
            presentSessions: presentRecords,
            percentage,
            records,
        };
    }

    async getSubjectAttendanceReport(subjectId: string) {
        const totalSessions = await this.prisma.attendanceSession.findMany({
            where: { subjectId, status: AttendanceSessionStatus.COMPLETED },
            include: {
                _count: {
                    select: { records: true },
                },
            },
        });

        const records = await this.prisma.attendanceRecord.findMany({
            where: {
                session: { subjectId, status: AttendanceSessionStatus.COMPLETED },
            },
            include: {
                student: {
                    select: { name: true, profile: { select: { regno: true } } },
                },
                session: true,
            },
        });

        // Calculate per-student stats for this subject
        const studentStats = new Map<string, { name: string; regno: string; total: number; present: number }>();

        records.forEach((rec) => {
            const stats = studentStats.get(rec.studentId) || {
                name: rec.student.name,
                regno: rec.student.profile?.regno || 'N/A',
                total: 0,
                present: 0,
            };
            stats.total++;
            if (rec.status === AttendanceStatus.PRESENT) stats.present++;
            studentStats.set(rec.studentId, stats);
        });

        return Array.from(studentStats.values()).map((s) => ({
            ...s,
            percentage: s.total > 0 ? (s.present / s.total) * 100 : 0,
        }));
    }

    async getStaffAttendanceReport(staffId: string) {
        return this.prisma.attendanceSession.findMany({
            where: { staffId },
            include: {
                subject: true,
                _count: {
                    select: { records: true },
                },
            },
            orderBy: { date: 'desc' },
        });
    }

    private getEnumDayOfWeek(day: number): DayOfWeek {
        const days = [
            DayOfWeek.MONDAY, // Map 0 (Sunday) to something? Tables usually don't have Sunday.
            DayOfWeek.MONDAY,
            DayOfWeek.TUESDAY,
            DayOfWeek.WEDNESDAY,
            DayOfWeek.THURSDAY,
            DayOfWeek.FRIDAY,
            DayOfWeek.SATURDAY,
        ];
        // getDay() returns 0 for Sunday, 1 for Monday...
        // In our enum, we have MONDAY to SATURDAY.
        if (day === 0) return DayOfWeek.MONDAY; // Default fallback or handle Sunday specifically
        return days[day];
    }
}
