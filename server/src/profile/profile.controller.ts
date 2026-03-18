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
  Request,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateProfileDto, UpdateProfileDto } from './dto';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  /**
   * Create a new profile (Admin only)
   * POST /profile
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProfileDto: CreateProfileDto) {
    return this.profileService.create(createProfileDto);
  }

  /**
   * Get all profiles with optional filters (Admin/Staff only)
   * GET /profile?userId=xxx&regno=xxx
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  async findAll(
    @Query('userId') userId?: string,
    @Query('regno') regno?: string,
  ) {
    return this.profileService.findAll(userId, regno);
  }

  /**
   * Get current user's profile with courses (for students)
   * GET /profile/me/courses
   */
  @Get('me/courses')
  async findMyProfileWithCourses(@Request() req) {
    const userId = req.user.id;
    return this.profileService.findByUserIdWithCourses(userId);
  }

  /**
   * Get current user's profile
   * GET /profile/me
   */
  @Get('me')
  async findMyProfile(@Request() req) {
    const userId = req.user.id;
    return this.profileService.findByUserId(userId);
  }

  /**
   * Get a single profile by ID (Admin/Staff only)
   * GET /profile/:id
   */
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  async findOne(@Param('id') id: string) {
    return this.profileService.findOne(id);
  }

  /**
   * Get profile by user ID (Admin/Staff only)
   * GET /profile/user/:userId
   */
  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  async findByUserId(@Param('userId') userId: string) {
    return this.profileService.findByUserId(userId);
  }

  /**
   * Update a profile by ID (Admin only)
   * PUT /profile/:id
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.update(id, updateProfileDto);
  }

  /**
   * Update current user's profile
   * PUT /profile/me
   */
  @Put('me')
  async updateMyProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.user.id;
    return this.profileService.updateByUserId(userId, updateProfileDto);
  }

  /**
   * Delete a profile by ID (Admin only)
   * DELETE /profile/:id
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.profileService.remove(id);
  }
}
