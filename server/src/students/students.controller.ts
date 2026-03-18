import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto, BulkPromoteDto } from './dto/student.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) { }

    @Get()
    @Roles('ADMIN', 'STAFF')
    @ApiOperation({ summary: 'Get all students' })
    findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('courseId') courseId?: string,
    ) {
        return this.studentsService.findAll(Number(page), Number(limit), search, courseId);
    }

    @Get('stats')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Get student management stats' })
    getStats() {
        return this.studentsService.getStats();
    }

    @Get(':id')
    @Roles('ADMIN', 'STAFF')
    @ApiOperation({ summary: 'Get student by ID' })
    findById(@Param('id') id: string) {
        return this.studentsService.findById(id);
    }

    @Post()
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Create a new student' })
    create(@Body() dto: CreateStudentDto) {
        return this.studentsService.create(dto);
    }

    @Post('bulk')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Bulk create students' })
    bulkCreate(@Body() dtos: CreateStudentDto[]) {
        return this.studentsService.bulkCreate(dtos);
    }

    @Patch(':id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Update student details' })
    update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
        return this.studentsService.update(id, dto);
    }

    @Post('bulk-promote')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Bulk promote students' })
    bulkPromote(@Body() dto: BulkPromoteDto) {
        return this.studentsService.bulkPromote(dto);
    }

    @Patch(':id/section')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Update student section/semester' })
    updateSection(
        @Param('id') id: string,
        @Body('section') section: string,
        @Body('semester') semester?: number,
    ) {
        return this.studentsService.updateSection(id, section, semester);
    }
}
