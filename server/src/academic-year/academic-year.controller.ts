import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AcademicYearService } from './academic-year.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('academic-years')
export class AcademicYearController {
    constructor(private readonly academicYearService: AcademicYearService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() createAcademicYearDto: CreateAcademicYearDto) {
        return this.academicYearService.create(createAcademicYearDto);
    }

    @Get()
    findAll() {
        return this.academicYearService.findAll();
    }
}
