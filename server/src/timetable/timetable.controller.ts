import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Timetable')
@Controller('timetable')
@UseGuards(JwtAuthGuard)
export class TimetableController {
    constructor(private readonly timetableService: TimetableService) { }

    @Post()
    @ApiOperation({ summary: 'Create a timetable entry' })
    create(@Body() dto: CreateTimetableDto) {
        return this.timetableService.createEntry(dto);
    }

    @Get('staff/:staffId')
    @ApiOperation({ summary: 'Get timetable for a staff member' })
    getStaffTimetable(@Param('staffId') staffId: string) {
        return this.timetableService.getStaffTimetable(staffId);
    }

    @Get('department/:departmentId')
    @ApiOperation({ summary: 'Get timetable for a department' })
    getByDepartment(@Param('departmentId') departmentId: string) {
        return this.timetableService.getDepartmentTimetable(departmentId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a timetable entry' })
    update(@Param('id') id: string, @Body() dto: UpdateTimetableDto) {
        return this.timetableService.updateEntry(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a timetable entry' })
    remove(@Param('id') id: string) {
        return this.timetableService.deleteEntry(id);
    }
}
