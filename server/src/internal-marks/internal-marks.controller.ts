import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InternalMarksService } from './internal-marks.service';
import { UpsertInternalMarkDto } from './dto/internal-mark.dto';
import { UpsertExternalMarkDto } from './dto/external-mark.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Internal Marks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('internal-marks')
export class InternalMarksController {
    constructor(private readonly marksService: InternalMarksService) { }

    @Post()
    @Roles('ADMIN', 'STAFF')
    @ApiOperation({ summary: 'Upsert student internal marks' })
    upsert(@Body() dto: UpsertInternalMarkDto) {
        return this.marksService.upsertMark(dto);
    }

    @Post('external')
    @Roles('ADMIN', 'STAFF')
    @ApiOperation({ summary: 'Upsert student external marks' })
    upsertExternal(@Body() dto: UpsertExternalMarkDto) {
        return this.marksService.upsertExternalMark(dto);
    }

    @Get('student/:studentId')
    @Roles('ADMIN', 'STAFF', 'STUDENT')
    @ApiOperation({ summary: 'Get marks for a specific student' })
    getStudentMarks(
        @Param('studentId') studentId: string,
        @Query('semester') semester?: string,
    ) {
        return this.marksService.getStudentMarks(studentId, semester ? parseInt(semester) : undefined);
    }

    @Get('results/:studentId')
    @Roles('ADMIN', 'STAFF', 'STUDENT')
    @ApiOperation({ summary: 'Get aggregated results for a specific student' })
    getStudentResults(
        @Param('studentId') studentId: string,
        @Query('semester') semester: string,
    ) {
        return this.marksService.getStudentResults(studentId, parseInt(semester));
    }

    @Get('subject/:subjectId')
    @Roles('ADMIN', 'STAFF')
    @ApiOperation({ summary: 'Get student marks for a specific subject' })
    getSubjectMarks(
        @Param('subjectId') subjectId: string,
        @Query('semester') semester: string,
    ) {
        return this.marksService.getSubjectMarks(subjectId, parseInt(semester));
    }
}
