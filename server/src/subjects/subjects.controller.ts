import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Subjects')
@Controller('subjects')
@UseGuards(JwtAuthGuard)
export class SubjectsController {
    constructor(private readonly subjectsService: SubjectsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new subject' })
    create(@Body() dto: CreateSubjectDto) {
        return this.subjectsService.create(dto);
    }

    @Get('department/:departmentId')
    @ApiOperation({ summary: 'Get subjects by department' })
    getByDepartment(
        @Param('departmentId') departmentId: string,
        @Query('semester') semester?: string,
    ) {
        return this.subjectsService.getByDepartment(departmentId, semester ? parseInt(semester) : undefined);
    }

    @Get()
    @ApiOperation({ summary: 'Get all subjects' })
    getAll() {
        return this.subjectsService.getAll();
    }
}
