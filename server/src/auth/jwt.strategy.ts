import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'defaultSecret',
    });
  }

  async validate(payload: any) {
    // Fetch full user data from database
    const user = await this.usersService.findById(payload.sub);
    
    if (!user || !user.isActive) {
      return null;
    }

    return { 
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      role: user.role,
      isActive: user.isActive,
    };
  }
}