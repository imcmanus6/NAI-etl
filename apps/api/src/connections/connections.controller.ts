import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsArray, IsIn, IsObject, IsOptional, IsString, MinLength } from 'class-validator';
import type { AuthClaims } from '@etl/auth';
import type { ConnectorType } from '@etl/shared-types';
import { prisma } from '@etl/database';
import { createConnectorRegistry } from '@etl/connectors';
import { createSecretsProvider } from '@etl/secrets';
import { CurrentUser, JwtAuthGuard } from '../auth/jwt.guard.js';

const registry = createConnectorRegistry();
const secrets = createSecretsProvider(process.env.SECRETS_PROVIDER ?? 'env', process.env.AWS_REGION);

class CreateConnectionDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsIn(['source', 'destination'])
  kind!: 'source' | 'destination';

  @IsString()
  connectorType!: ConnectorType;

  @IsObject()
  config!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  secretRef?: string;
}

class DeliverDto {
  @IsArray()
  records!: Record<string, unknown>[];
}

@ApiTags('connections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('connections')
export class ConnectionsController {
  @Get()
  list(@CurrentUser() user: AuthClaims) {
    return prisma.connection.findMany({ where: { tenantId: user.tenantId } });
  }

  @Post()
  async create(@CurrentUser() user: AuthClaims, @Body() dto: CreateConnectionDto) {
    const connector = registry.has(dto.connectorType) ? registry.get(dto.connectorType) : null;
    return prisma.connection.create({
      data: {
        tenantId: user.tenantId,
        name: dto.name,
        kind: dto.kind,
        connectorType: dto.connectorType,
        config: dto.config as object,
        secretRef: dto.secretRef,
        capabilities: (connector?.capabilities ?? {}) as object,
      },
    });
  }

  /**
   * Test a connection. Connection testing is lightweight, so it runs inline;
   * heavy extraction/discovery is dispatched to workers, not the API.
   */
  @Post(':id/test')
  async test(@CurrentUser() user: AuthClaims, @Param('id') id: string) {
    const conn = await prisma.connection.findFirst({ where: { id, tenantId: user.tenantId } });
    if (!conn) return { ok: false, message: 'Connection not found' };
    if (!registry.has(conn.connectorType as ConnectorType)) {
      return { ok: false, message: `No connector for ${conn.connectorType}` };
    }
    const connector = registry.get(conn.connectorType as ConnectorType);
    const resolved = conn.secretRef ? await secrets.resolve(conn.secretRef) : {};
    return connector.testConnection({
      connectionId: conn.id,
      connectorType: conn.connectorType as ConnectorType,
      config: conn.config as Record<string, unknown>,
      secrets: resolved,
    });
  }

  /**
   * Write records to a destination connection (e.g. the Lateral import API).
   * Records must already be in the destination's field shape. Heavy delivery
   * runs go through the workers; this covers interactive / test delivery.
   */
  @Post(':id/deliver')
  async deliver(@CurrentUser() user: AuthClaims, @Param('id') id: string, @Body() dto: DeliverDto) {
    const conn = await prisma.connection.findFirst({ where: { id, tenantId: user.tenantId } });
    if (!conn) return { ok: false, message: 'Connection not found' };
    if (!registry.has(conn.connectorType as ConnectorType)) {
      return { ok: false, message: `No connector for ${conn.connectorType}` };
    }
    const connector = registry.get(conn.connectorType as ConnectorType);
    if (!connector.write) return { ok: false, message: `${conn.connectorType} cannot write data` };
    const resolved = conn.secretRef ? await secrets.resolve(conn.secretRef) : {};
    const result = await connector.write(
      {
        connectionId: conn.id,
        connectorType: conn.connectorType as ConnectorType,
        config: conn.config as Record<string, unknown>,
        secrets: resolved,
      },
      dto.records ?? [],
      { entity: '', mode: 'insert' },
    );
    return { ok: result.failed === 0, ...result };
  }
}
