import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CMSUserRole } from '@prisma/client';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(CMSUserRole.ADMIN) // Only admins can access general reports
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('summary')
    getSummary(@Query('year') year: string) {
        return this.reportsService.getSummary(year);
    }

    @Get('attendance-trends')
    getAttendanceTrends(@Query('year') year: string) {
        return this.reportsService.getAttendanceTrends(year);
    }

    @Get('department-performance')
    getDepartmentPerformance(@Query('year') year: string) {
        return this.reportsService.getDepartmentPerformance(year);
    }

    @Get('result-analysis')
    getResultAnalysis(@Query('year') year: string) {
        return this.reportsService.getResultAnalysis(year);
    }

    @Get('staff-activity')
    getStaffActivity(@Query('year') year: string) {
        return this.reportsService.getStaffActivity(year);
    }

    @Get('academic-stats')
    getAcademicStats(@Query('year') year: string) {
        return this.reportsService.getAcademicStats(year);
    }
}
