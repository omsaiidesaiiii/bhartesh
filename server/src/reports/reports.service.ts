import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    async getSummary(year: string) {
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year}-12-31`);

        const totalStudents = await this.prisma.user.count({
            where: { role: 'STUDENT', createdAt: { gte: startDate, lte: endDate } },
        });

        // Mocking some improvements/changes for now
        const lastYearTotal = await this.prisma.user.count({
            where: { role: 'STUDENT', createdAt: { gte: new Date(`${Number(year) - 1}-01-01`), lte: new Date(`${Number(year) - 1}-12-31`) } },
        });
        const studentChange = lastYearTotal === 0 ? '+100%' : `+${Math.round(((totalStudents - lastYearTotal) / lastYearTotal) * 100)}%`;

        // Attendance Calculation
        const attendanceRecords = await this.prisma.attendanceRecord.findMany({
            where: { markedAt: { gte: startDate, lte: endDate } },
        });
        const presentCount = attendanceRecords.filter(r => r.status === 'PRESENT').length;
        const avgAttendance = attendanceRecords.length > 0 ? Math.round((presentCount / attendanceRecords.length) * 100) : 0;

        // Pass Rate Calculation (External Marks > 35%)
        const externalMarks = await this.prisma.externalMark.findMany({
            where: { createdAt: { gte: startDate, lte: endDate } }
        });
        const passCount = externalMarks.filter(m => (m.marks / m.maxMarks) >= 0.35).length;
        const passRate = externalMarks.length > 0 ? Math.round((passCount / externalMarks.length) * 100) : 0;

        return {
            totalStudents,
            totalStudentsChange: studentChange + " vs last year",
            avgAttendance: avgAttendance,
            avgAttendanceNote: "Across all depts",
            passRate: passRate,
            passRateChange: "+2% improvement", // Mocked change for now
            topDept: "Computer Science",
            topDeptNote: "Highest avg GPA",
        };
    }

    async getAttendanceTrends(year: string) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const trends: any[] = [];

        for (let i = 0; i < 6; i++) { // Just last 6 months for the chart in frontend
            const monthDate = new Date(`${year}-${i + 1}-01`);
            const nextMonthDate = new Date(`${year}-${i + 2}-01`);

            const records = await this.prisma.attendanceRecord.findMany({
                where: { markedAt: { gte: monthDate, lt: nextMonthDate } }
            });

            const present = records.length > 0 ? Math.round((records.filter(r => r.status === 'PRESENT').length / records.length) * 100) : 0;
            const absent = 100 - present;

            trends.push({ month: months[i], present, absent });
        }

        return trends;
    }

    async getDepartmentPerformance(year: string) {
        const departments = await this.prisma.department.findMany({
            include: {
                users: {
                    where: { role: 'STUDENT' },
                    include: { externalMarks: true }
                }
            }
        });

        return departments.map(dept => {
            let totalMarks = 0;
            let count = 0;
            dept.users.forEach(user => {
                user.externalMarks.forEach(mark => {
                    totalMarks += (mark.marks / mark.maxMarks) * 100;
                    count++;
                });
            });
            return {
                name: dept.name,
                score: count > 0 ? Math.round(totalMarks / count) : 0
            };
        }).sort((a, b) => b.score - a.score);
    }

    async getResultAnalysis(year: string) {
        const externalMarks = await this.prisma.externalMark.findMany({
            where: { createdAt: { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`) } }
        });

        const passed = externalMarks.filter(m => (m.marks / m.maxMarks) >= 0.35).length;
        const failed = externalMarks.length - passed;

        return [
            { name: 'Passed', value: passed },
            { name: 'Failed', value: failed },
        ];
    }

    async getStaffActivity(year: string) {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        // Mocking staff activity based on AttendanceSessions created
        return days.map(day => ({
            day,
            active: Math.floor(Math.random() * 20) + 30 // Mock data for now
        }));
    }

    async getAcademicStats(year: string) {
        // Top performing classes (semester-wise)
        const departments = await this.prisma.department.findMany({
            include: {
                users: {
                    where: { role: 'STUDENT' },
                    include: { externalMarks: true, profile: true }
                }
            }
        });

        const classStats: Record<string, { total: number, count: number }> = {};

        departments.forEach(dept => {
            dept.users.forEach(user => {
                if (user.profile?.semester) {
                    const key = `${dept.name} Sem ${user.profile.semester}`;
                    if (!classStats[key]) classStats[key] = { total: 0, count: 0 };

                    user.externalMarks.forEach(mark => {
                        classStats[key].total += (mark.marks / mark.maxMarks) * 100;
                        classStats[key].count++;
                    });
                }
            });
        });

        const topClasses = Object.entries(classStats)
            .map(([name, stats]) => ({ name, avg: stats.count > 0 ? Math.round(stats.total / stats.count) : 0 }))
            .sort((a, b) => b.avg - a.avg)
            .slice(0, 3);

        // Recent assessments
        const exams = await (this.prisma as any).exam.findMany({
            where: { date: { lte: new Date() } },
            orderBy: { date: 'desc' },
            take: 3
        });

        const recentAssessments = exams.map(exam => ({
            name: exam.name,
            date: exam.date.toLocaleDateString()
        }));

        return { topClasses, recentAssessments };
    }
}
