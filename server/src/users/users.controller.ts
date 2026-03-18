import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('role') role?: string,
    @Query('departmentId') departmentId?: string
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.usersService.findAll(pageNum, limitNum, role, departmentId);
  }


  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getStats() {
    return this.usersService.getStaffStats();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('workload')
  async getWorkload() {
    return this.usersService.getStaffWorkload();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.usersService.setActiveStatus(id, body.isActive);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('store-fcm-token')
  async storeFcmToken(@Request() req, @Body() body: { token: string; deviceType: string }) {
    const userId = req.user.id;
    return this.usersService.storeFcmToken(userId, body.token, body.deviceType);
  }
}
