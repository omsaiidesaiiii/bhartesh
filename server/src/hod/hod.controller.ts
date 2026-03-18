import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { HodService } from './hod.service';
import { AssignHodDto } from './dto/assign-hod.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('HOD')
@Controller('hod')
@UseGuards(JwtAuthGuard)
export class HodController {
    constructor(private readonly hodService: HodService) { }

    @Post()
    @ApiOperation({ summary: 'Assign HOD to a department' })
    assign(@Body() dto: AssignHodDto) {
        return this.hodService.assignHod(dto);
    }

    @Get(':departmentId')
    @ApiOperation({ summary: 'Get HOD of a department' })
    get(@Param('departmentId') departmentId: string) {
        return this.hodService.getHod(departmentId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all HOD assignments' })
    findAll() {
        return this.hodService.findAll();
    }
}
