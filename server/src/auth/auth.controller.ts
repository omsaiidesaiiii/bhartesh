import { Controller, Post, Body, UseGuards, Request, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { CredentialLoginDto, FirebaseLoginDto, CreateStaffDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Admin/Staff Login - Credential based authentication
   * POST /auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginWithCredentials(@Body() loginDto: CredentialLoginDto) {
    return this.authService.loginWithCredentials(loginDto);
  }

  /**
   * Student Login - Firebase (Google) authentication
   * POST /auth/firebase
   */
  @Post('firebase')
  @HttpCode(HttpStatus.OK)
  async loginWithFirebase(@Body() loginDto: FirebaseLoginDto) {
    return this.authService.loginWithFirebase(loginDto);
  }

  /**
   * Create Staff - Admin only
   * POST /auth/staff
   */
  @Post('staff')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createStaff(@Body() createStaffDto: CreateStaffDto, @Request() req) {
    return this.authService.createStaff(createStaffDto, req.user.id);
  }

  /**
   * Refresh Token
   * POST /auth/refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: { token: string }) {
    return this.authService.refresh(body.token);
  }

  /**
   * Get Current User Profile
   * GET /auth/me
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      username: req.user.username,
      role: req.user.role,
      isActive: req.user.isActive,
    };
  }

  /**
   * Validate Token - Check if token is valid
   * POST /auth/validate
   */
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validateToken(@Body() body: { token: string }) {
    const user = await this.authService.validateToken(body.token);
    return { valid: !!user, user };
  }
}