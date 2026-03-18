import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SetupService } from './setup.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateDepartmentDto } from './dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Controller('setup')
@UseGuards(JwtAuthGuard)
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  // ==================== DEPARTMENT ENDPOINTS ====================

  /**
   * Create a new department
   * POST /setup/departments
   */
  @Post('departments')
  @HttpCode(HttpStatus.CREATED)
  async createDepartment(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.setupService.createDepartment(createDepartmentDto);
  }

  /**
   * Get all departments
   * GET /setup/departments
   */
  @Get('departments')
  async findAllDepartments() {
    return this.setupService.findAllDepartments();
  }

  /**
   * Get a single department by ID
   * GET /setup/departments/:id
   */
  @Get('departments/:id')
  async findDepartmentById(@Param('id') id: string) {
    return this.setupService.findDepartmentById(id);
  }

  /**
   * Update a department
   * PUT /setup/departments/:id
   */
  @Put('departments/:id')
  async updateDepartment(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.setupService.updateDepartment(id, updateDepartmentDto);
  }

  /**
   * Delete a department
   * DELETE /setup/departments/:id
   */
  @Delete('departments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDepartment(@Param('id') id: string) {
    await this.setupService.deleteDepartment(id);
  }
}
