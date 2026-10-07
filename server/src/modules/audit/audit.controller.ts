import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RequireAccess } from 'src/common/decorators/access.decorator';
import { AccessGuard } from 'src/common/guards/access.guard';
import type { Paginated } from 'src/common/types/pagination.types';
import { AuditService } from 'src/modules/audit/audit.service';
import { QueryAuditDto } from 'src/modules/audit/dto/query-audit.dto';
import type { AuditLogEntry } from 'src/modules/audit/types/audit.types';

@Controller('audit')
@RequireAccess('auditoria', 'ver')
@UseGuards(AccessGuard)
export class AuditController {
	constructor(private readonly auditService: AuditService) {}

	/** Lista as movimentações do sistema, da mais recente para a mais antiga. */
	@Get()
	findAll(@Query() query: QueryAuditDto): Promise<Paginated<AuditLogEntry>> {
		return this.auditService.findAll(query);
	}
}
