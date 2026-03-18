import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { getFirebaseAdmin } from '../firebase/firebase-admin.provider';
import * as bcrypt from 'bcryptjs';
import * as admin from 'firebase-admin';
import {
  CredentialLoginDto,
  FirebaseLoginDto,
  CreateStaffDto,
  AuthResponse,
} from './dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  /**
   * Allowed college email domain for students
   */
  private readonly allowedEmailDomain =
    process.env.ALLOWED_EMAIL_DOMAIN || '@college.edu';
  private readonly firebaseAdmin: typeof admin;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {
    this.firebaseAdmin = getFirebaseAdmin(); // ✅ SAFE
  }

  // ===========================================================================
  // ADMIN / STAFF AUTH
  // ===========================================================================

  /**
   * Validate Admin/Staff credentials
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account is deactivated');
    }

    return user;
  }

  /**
   * Admin/Staff login
   */
  async loginWithCredentials(
    loginDto: CredentialLoginDto,
  ): Promise<AuthResponse> {
    const user = await this.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.generateAuthResponse(user);
  }

  // ===========================================================================
  // STUDENT AUTH (FIREBASE)
  // ===========================================================================

  /**
   * Student login with Firebase (Google)
   */
  async loginWithFirebase(
    loginDto: FirebaseLoginDto,
  ): Promise<AuthResponse> {
    try {
      const decodedToken = await admin
        .auth()
        .verifyIdToken(loginDto.idToken);

      const { uid, email, name, picture } = decodedToken;

      if (!email) {
        throw new BadRequestException('Email is required');
      }

      if (!email.endsWith(this.allowedEmailDomain)) {
        throw new ForbiddenException(
          `Only ${this.allowedEmailDomain} email addresses are allowed`,
        );
      }

      let user = await this.usersService.findByFirebaseUid(uid);

      if (user) {
        if (user.role !== 'STUDENT') {
          throw new ForbiddenException(
            'Invalid authentication method for this account',
          );
        }

        if (!user.isActive) {
          throw new ForbiddenException('Account is deactivated');
        }
      } else {
        user = await this.usersService.createStudent({
          firebaseUid: uid,
          email,
          name: name || email.split('@')[0],
          profileImageUrl: picture,
        });
      }

      return this.generateAuthResponse(user);
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  // ===========================================================================
  // STAFF MANAGEMENT
  // ===========================================================================

  /**
   * Create Staff (Admin only)
   */
  async createStaff(
    createStaffDto: CreateStaffDto,
    adminId: string,
  ): Promise<User> {
    const { name, username, email, password, phone, departmentId } =
      createStaffDto;

    const hashedPassword = await bcrypt.hash(password, 12);

    return this.usersService.createStaff({
      name,
      username,
      email,
      password: hashedPassword,
      phone,
      departmentId,
      createdById: adminId,
    });
  }

  // ===========================================================================
  // JWT HELPERS
  // ===========================================================================

  private async generateAuthResponse(
    user: User,
  ): Promise<AuthResponse> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username ?? undefined,
        role: user.role,
        isActive: user.isActive,
        profileImageUrl: user.profileImageUrl ?? undefined,
      },
    };
  }

  async refresh(token: string): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify(token, {
        ignoreExpiration: true,
      });

      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (!user.isActive) {
        throw new ForbiddenException('Account is deactivated');
      }

      return this.generateAuthResponse(user);
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);

      if (!user || !user.isActive) {
        return null;
      }

      return user;
    } catch {
      return null;
    }
  }
}
