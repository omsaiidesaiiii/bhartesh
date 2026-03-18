import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCourseDto, UpdateCourseDto } from './dto';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  /**
   * Create a new course
   * POST /courses
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  /**
   * Get all courses with optional filters
   * GET /courses?departmentId=xxx&status=ACTIVE&type=UNDERGRADUATE
   */
  @Get()
  async findAll(
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.courseService.findAll(departmentId, status, type);
  }

  /**
   * Get a single course by ID
   * GET /courses/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.courseService.findOne(id);
  }

  /**
   * Update a course
   * PUT /courses/:id
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(id, updateCourseDto);
  }

  /**
   * Delete a course
   * DELETE /courses/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.courseService.remove(id);
  }

  /**
   * Get courses by department
   * GET /courses/department/:departmentId
   */
  @Get('department/:departmentId')
  async findByDepartment(@Param('departmentId') departmentId: string) {
    return this.courseService.findByDepartment(departmentId);
  }
}
