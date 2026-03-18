import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto, UpdateExamDto, SubmitMarksDto } from './dto/exam.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Exams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exams')
export class ExamsController {
    constructor(private readonly examsService: ExamsService) { }

    @Post()
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Create a new exam' })
    create(@Body() createExamDto: CreateExamDto) {
        return this.examsService.create(createExamDto);
    }

    @Get()
    @Roles('ADMIN', 'STAFF', 'STUDENT')
    @ApiOperation({ summary: 'Get all exams' })
    findAll() {
        return this.examsService.findAll();
    }

    @Get('stats')
    @Roles('ADMIN', 'STAFF')
    @ApiOperation({ summary: 'Get exam dashboard statistics' })
    getDashboardStats() {
        return this.examsService.getDashboardStats();
    }

    @Get('results-overview')
    @Roles('ADMIN', 'STAFF')
    @ApiOperation({ summary: 'Get result overview for all subjects' })
    getResultOverview() {
        return this.examsService.getResultOverview();
    }

    @Get('staff-exams')
    @Roles('STAFF')
    @ApiOperation({ summary: 'Get exams relevant to staff' })
    getStaffExams(@Req() req: any) {
        return this.examsService.getStaffExams(req.user.id);
    }

    @Get('staff-subjects')
    @Roles('STAFF')
    @ApiOperation({ summary: 'Get subjects assigned to staff by department' })
    getStaffSubjects(@Req() req: any) {
        return this.examsService.getStaffSubjects(req.user.id);
    }

    @Post('submit-marks')
    @Roles('STAFF', 'ADMIN')
    @ApiOperation({ summary: 'Submit marks for students' })
    submitMarks(@Body() submitMarksDto: SubmitMarksDto) {
        return this.examsService.submitMarks(submitMarksDto);
    }

    @Get(':examId/students')
    @Roles('STAFF', 'ADMIN')
    @ApiOperation({ summary: 'Get students for marks entry' })
    getStudentsForMarksEntry(
        @Param('examId') examId: string,
        @Query('subjectId') subjectId: string,
        @Query('semester') semester: string
    ) {
        return this.examsService.getStudentsForMarksEntry(examId, subjectId, parseInt(semester));
    }

    @Get(':id')
    @Roles('ADMIN', 'STAFF', 'STUDENT')
    @ApiOperation({ summary: 'Get a specific exam' })
    findOne(@Param('id') id: string) {
        return this.examsService.findOne(id);
    }

    @Patch(':id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Update an exam' })
    update(@Param('id') id: string, @Body() updateExamDto: UpdateExamDto) {
        return this.examsService.update(id, updateExamDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Delete an exam' })
    remove(@Param('id') id: string) {
        return this.examsService.remove(id);
    }
}

