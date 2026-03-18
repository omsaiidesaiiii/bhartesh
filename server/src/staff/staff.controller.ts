import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import { AssignSubjectDto } from './dto/assign-subject.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Staff')
@Controller('staff')
@UseGuards(JwtAuthGuard)
export class StaffController {
    constructor(private readonly staffService: StaffService) { }

    @Post(':staffId/subjects')
    @ApiOperation({ summary: 'Assign a subject to a staff member' })
    assignSubject(
        @Param('staffId') staffId: string,
        @Body() dto: AssignSubjectDto,
    ) {
        return this.staffService.assignSubject(staffId, dto);
    }

    @Get(':staffId/subjects')
    @ApiOperation({ summary: 'Get all subjects assigned to a staff member' })
    getSubjects(@Param('staffId') staffId: string) {
        return this.staffService.getStaffSubjects(staffId);
    }
}
