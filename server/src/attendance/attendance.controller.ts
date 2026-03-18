import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CMSUserRole } from '@prisma/client';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Get('sessions/today')
    @Roles(CMSUserRole.STAFF)
    async getTodaySessions(@Request() req) {
        return this.attendanceService.getTodaySessionsForStaff(req.user.id);
    }

    @Get('sessions/:id/students')
    @Roles(CMSUserRole.STAFF)
    async getStudents(@Param('id') sessionId: string) {
        return this.attendanceService.getStudentsForSession(sessionId);
    }

    @Post('sessions/:id/mark')
    @Roles(CMSUserRole.STAFF)
    async markAttendance(
        @Param('id') sessionId: string,
        @Body() records: { studentId: string; status: AttendanceStatus; remarks?: string }[],
    ) {
        return this.attendanceService.markAttendance(sessionId, records);
    }

    @Post('sessions/:id/lock')
    @Roles(CMSUserRole.STAFF, CMSUserRole.ADMIN)
    async lockSession(@Param('id') sessionId: string) {
        return this.attendanceService.lockSession(sessionId);
    }

    @Post('sessions/:id/cancel')
    @Roles(CMSUserRole.STAFF)
    async cancelSession(@Param('id') sessionId: string) {
        return this.attendanceService.cancelSession(sessionId);
    }

    @Get('report/student/:id')
    async getStudentReport(@Param('id') studentId: string) {
        return this.attendanceService.getStudentAttendanceReport(studentId);
    }

    @Get('report/subject/:id')
    @Roles(CMSUserRole.STAFF, CMSUserRole.ADMIN)
    async getSubjectReport(@Param('id') subjectId: string) {
        return this.attendanceService.getSubjectAttendanceReport(subjectId);
    }

    @Get('report/staff/me')
    @Roles(CMSUserRole.STAFF)
    async getMyReport(@Request() req) {
        return this.attendanceService.getStaffAttendanceReport(req.user.id);
    }

    @Get('report/staff/:id')
    @Roles(CMSUserRole.ADMIN, CMSUserRole.STAFF)
    async getStaffReport(@Param('id') staffId: string) {
        return this.attendanceService.getStaffAttendanceReport(staffId);
    }
}
