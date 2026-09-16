import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { sql } from 'drizzle-orm';
import { Public } from 'src/common/decorators/public.decorator';
import { DB } from 'src/db/db.provider';
import type { Database } from 'src/db/types/db.types';
import type { HealthStatus } from 'src/modules/health/types/health.types';

@ApiTags('health')
@Controller('health')
export class HealthController {
	constructor(@Inject(DB) private readonly db: Database) {}

	/** Verifica se a API e o banco estão respondendo. */
	@Get()
	@Public()
	@ApiOkResponse({ description: 'API e banco operacionais.' })
	async check(): Promise<HealthStatus> {
		try {
			await this.db.execute(sql`SELECT 1`);
		} catch {
			throw new ServiceUnavailableException('Banco de dados indisponível.');
		}

		return { status: 'ok', db: 'connected', uptime: process.uptime() };
	}
}
