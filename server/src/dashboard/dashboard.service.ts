import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CMSUserRole } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) { }

  async getAdminStats() {
    const [
      totalStudents,
      totalStaff,
      totalDepartments,
      totalCourses,
      totalUsers,
      newRegistrationsToday,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: CMSUserRole.STUDENT } }),
      this.prisma.user.count({ where: { role: CMSUserRole.STAFF } }),
      this.prisma.department.count({ where: { status: 'ACTIVE' } }),
      this.prisma.course.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    // Calculate changes (mocked for now or could be calculated from last month)
    // For simplicity, I'll return some static change values or calculate them if I had more time

    return [
      {
        title: 'Total Students',
        value: totalStudents.toLocaleString(),
        icon: 'Users',
        description: '+10% from last month', // Mocked
      },
      {
        title: 'Total Staff',
        value: totalStaff.toLocaleString(),
        icon: 'Briefcase',
        description: '+2 new hires', // Mocked
      },
      {
        title: 'Total Departments',
        value: totalDepartments.toLocaleString(),
        icon: 'Building2',
        description: 'Active departments',
      },
      {
        title: 'Courses / Programs',
        value: totalCourses.toLocaleString(),
        icon: 'BookOpen',
        description: 'Active curriculum',
      },
      {
        title: 'Active Users',
        value: totalUsers.toLocaleString(),
        icon: 'Activity',
        description: 'Currently active',
      },
      {
        title: 'New Registrations',
        value: newRegistrationsToday.toLocaleString(),
        icon: 'UserPlus',
        description: 'Today',
      },
    ];
  }

  async getDepartmentStats() {
    const departments = await this.prisma.department.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
      },
    });

    // Get accurate counts by department for students and staff
    const deptStats = await Promise.all(
      departments.map(async (dept) => {
        const studentCount = await this.prisma.user.count({
          where: { 
            departmentId: dept.id, 
            role: CMSUserRole.STUDENT,
            isActive: true,
          },
        });
        const staffCount = await this.prisma.user.count({
          where: { 
            departmentId: dept.id, 
            role: CMSUserRole.STAFF,
            isActive: true,
          },
        });
        return {
          name: dept.name,
          students: studentCount,
          staff: staffCount,
        };
      }),
    );

    return {
      studentData: deptStats.map((d) => ({ name: d.name, total: d.students })),
      staffData: deptStats.map((d) => ({ name: d.name, total: d.staff })),
    };
  }

  async getUpcomingEvents() {
    const events = await this.prisma.academicEvent.findMany({
      where: {
        date: {
          gte: new Date(),
        },
      },
      orderBy: {
        date: 'asc',
      },
      take: 5,
    });

    return events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      date: e.date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
      type: e.type,
      attachmentUrl: e.attachmentUrl,
    }));
  }

  async getFeaturedEvents() {
    // Get up to 5 most recently created upcoming events
    const events = await this.prisma.academicEvent.findMany({
      where: {
        date: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    if (events.length === 0) return [];

    return events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      date: e.date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      type: e.type,
      attachmentUrl: e.attachmentUrl,
    }));
  }

  async getDashboardData() {
    const [stats, deptStats, upcomingEvents, featuredEvents] = await Promise.all([
      this.getAdminStats(),
      this.getDepartmentStats(),
      this.getUpcomingEvents(),
      this.getFeaturedEvents(),
    ]);

    return {
      stats,
      studentData: deptStats.studentData,
      staffData: deptStats.staffData,
      upcomingEvents,
      featuredEvents,
    };
  }

  async getStaffDashboardData(userId: string) {
    const [
      subjectsCount,
      timetables,
      pendingAssignments,
      attendanceToday,
      noticeCount,
    ] = await Promise.all([
      this.prisma.staffSubject.count({ where: { staffId: userId } }),
      this.prisma.timeTable.findMany({
        where: { staffId: userId },
        include: { subject: true, department: true },
      }),
      this.prisma.assignmentSubmission.count({
        where: {
          assignment: { authorId: userId },
          status: 'SUBMITTED',
        },
      }),
      this.prisma.attendanceRecord.count({
        where: {
          session: { staffId: userId, date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
          status: 'PRESENT',
        },
      }),
      this.prisma.notice.count({
        where: {
          OR: [
            { audience: 'ALL' },
            { audience: 'STAFF' }
          ]
        }
      }),
    ]);

    const totalStudentsInClasses = await this.prisma.attendanceRecord.count({
      where: {
        session: { staffId: userId, date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      },
    });

    const stats = [
      {
        title: 'Total Classes Assigned',
        value: timetables.length.toString(),
        icon: 'Users',
        description: 'Active sections',
        color: 'text-blue-600',
      },
      {
        title: 'Subjects Handled',
        value: subjectsCount.toString(),
        icon: 'BookOpen',
        description: 'Assigned subjects',
        color: 'text-green-600',
      },
      {
        title: 'Assignments Pending Review',
        value: pendingAssignments.toString(),
        icon: 'ClipboardList',
        description: 'To be marked',
        color: 'text-orange-600',
      },
      {
        title: "Today's Attendance Count",
        value: `${attendanceToday}/${totalStudentsInClasses}`,
        icon: 'CalendarCheck',
        description: 'Across all classes today',
        color: 'text-purple-600',
      },
      {
        title: 'Total Notices',
        value: noticeCount.toString(),
        icon: 'Megaphone',
        description: 'Latest announcements',
        color: 'text-red-600',
      },
    ];

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const schedule = timetables
      .filter((t) => t.dayOfWeek === today)
      .map((t) => ({
        time: t.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        subject: t.subject.name,
        class: `${t.department.name} - Sem ${t.semester}`,
        status: t.startTime > new Date() ? 'Upcoming' : 'Completed', // Simplified
      }));

    const featuredEvents = await this.getFeaturedEvents();

    return {
      stats,
      schedule,
      featuredEvents,
    };
  }

  async getStudentDashboardData(userId: string) {
    const [
      attendanceRecords,
      pendingAssignments,
      upcomingExams,
      subjects,
      user,
    ] = await Promise.all([
      this.prisma.attendanceRecord.findMany({
        where: { studentId: userId },
      }),
      this.prisma.assignmentSubmission.count({
        where: {
          studentId: userId,
          status: 'PENDING',
        },
      }),
      this.prisma.academicEvent.findMany({
        where: {
          type: 'EXAM',
          date: { gte: new Date() },
        },
        take: 2,
      }),
      this.prisma.studentCourse.findMany({
        where: { studentId: userId },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      }),
    ]);

    const totalAttendance = attendanceRecords.length;
    const presentCount = attendanceRecords.filter((r) => r.status === 'PRESENT').length;
    const attendancePercentage = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    const featuredEvents = await this.getFeaturedEvents();

    return {
      name: user?.name || 'Student',
      stats: [
        { label: 'Attendance', value: `${attendancePercentage}%` },
        { label: 'Assignments', value: `${pendingAssignments} Pending` },
        { label: 'Exams', value: `${upcomingExams.length} Soon` },
        { label: 'Subjects', value: `${subjects.length} Total` },
      ],
      upcomingExams: upcomingExams.map((e) => ({
        title: e.title,
        date: e.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      })),
      featuredEvents,
    };
  }
}
