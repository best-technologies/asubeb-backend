import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { DataCacheService } from '../../common/cache/data-cache.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private dataCacheService: DataCacheService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('app.jwtSecret'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: JwtPayload) {
    let token: string | null = null;
    const authHeader = req?.headers?.authorization || req?.headers?.Authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (token && this.dataCacheService.get(`blacklist:${token}`)) {
      throw new UnauthorizedException('Token has been invalidated. Please sign in again.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid token');
    }

    // return minimal user object for request
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      stateId: user.stateId,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
