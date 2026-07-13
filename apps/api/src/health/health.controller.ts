import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { prisma } from '@etl/database';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  async check() {
    let db = 'unknown';
    try {
      await prisma.$queryRaw`SELECT 1`;
      db = 'ok';
    } catch {
      db = 'unreachable';
    }
    return { status: 'ok', db, ts: new Date().toISOString() };
  }
}
