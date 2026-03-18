import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CMSUserRole } from '@prisma/client';
import { Request } from 'express';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @Roles(CMSUserRole.ADMIN)
  async getAdminDashboard() {
    return this.dashboardService.getDashboardData();
  }

  @Get('staff')
  @Roles(CMSUserRole.STAFF)
  async getStaffDashboard(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.dashboardService.getStaffDashboardData(userId);
  }

  @Get('student')
  @Roles(CMSUserRole.STUDENT)
  async getStudentDashboard(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.dashboardService.getStudentDashboardData(userId);
  }
}
