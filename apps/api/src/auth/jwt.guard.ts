import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import type { Request } from 'express';
import type { AuthClaims } from '@etl/auth';
import { AuthService } from './auth.service.js';

/** Guard that requires a valid Bearer token and attaches claims to the request. */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user?: AuthClaims }>();
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedException('Missing bearer token');
    try {
      req.user = await this.auth.verifyAccessToken(header.slice(7));
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

/** Param decorator: inject the authenticated claims into a handler. */
export const CurrentUser = createParamDecorator((_data, ctx: ExecutionContext): AuthClaims => {
  const req = ctx.switchToHttp().getRequest<Request & { user: AuthClaims }>();
  return req.user;
});
