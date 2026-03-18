import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto, UpdateAssignmentDto } from './dto/create-assignment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CMSUserRole } from '@prisma/client';

@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
    constructor(private readonly assignmentsService: AssignmentsService) { }

    @Post()
    @Roles('ADMIN', 'STAFF')
    create(@Body() createAssignmentDto: CreateAssignmentDto, @Request() req) {
        return this.assignmentsService.create(createAssignmentDto, req.user.id);
    }

    @Get()
    @Roles('ADMIN', 'STAFF')
    findAll(@Request() req, @Query('semester') semester?: string, @Query('departmentId') departmentId?: string) {
        const filters: any = {};
        if (semester) filters.semester = parseInt(semester);
        if (departmentId) filters.departmentId = departmentId;

        return this.assignmentsService.findAll(filters);
    }

    @Get('student')
    @Roles('STUDENT')
    getStudentAssignments(@Request() req) {
        return this.assignmentsService.getStudentAssignments(req.user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.assignmentsService.findOne(id);
    }

    @Patch(':id')
    @Roles('ADMIN', 'STAFF')
    update(@Param('id') id: string, @Body() updateAssignmentDto: UpdateAssignmentDto) {
        return this.assignmentsService.update(id, updateAssignmentDto);
    }

    @Delete(':id')
    @Roles('ADMIN', 'STAFF')
    remove(@Param('id') id: string) {
        return this.assignmentsService.remove(id);
    }

    @Get(':id/submissions')
    @Roles('ADMIN', 'STAFF')
    getSubmissions(@Param('id') id: string) {
        return this.assignmentsService.getSubmissions(id);
    }

    @Post(':id/submissions/:studentId')
    @Roles('ADMIN', 'STAFF')
    markAsSubmitted(
        @Param('id') id: string,
        @Param('studentId') studentId: string,
        @Request() req
    ) {
        return this.assignmentsService.markAsSubmitted(id, studentId, req.user.id);
    }
}
