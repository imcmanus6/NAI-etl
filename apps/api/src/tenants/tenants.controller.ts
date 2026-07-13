import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthClaims } from '@etl/auth';
import { prisma } from '@etl/database';
import { CurrentUser, JwtAuthGuard } from '../auth/jwt.guard.js';

@ApiTags('tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  /** Returns the current tenant + white-label config used to theme the web app. */
  @Get('me')
  async me(@CurrentUser() user: AuthClaims) {
    const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });
    return {
      id: tenant?.id,
      slug: tenant?.slug,
      name: tenant?.name,
      whiteLabel: tenant?.whiteLabel ?? {},
    };
  }
}
