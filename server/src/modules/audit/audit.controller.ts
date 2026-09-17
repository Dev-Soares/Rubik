import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import type { Paginated } from 'src/common/types/pagination.types';
import { AuditService } from 'src/modules/audit/audit.service';
import { QueryAuditDto } from 'src/modules/audit/dto/query-audit.dto';
import type { AuditLogEntry } from 'src/modules/audit/types/audit.types';

@ApiTags('audit')
@Controller('audit')
@Roles('admin')
@UseGuards(RolesGuard)
export class AuditController {
	constructor(private readonly auditService: AuditService) {}

	/** Lista as movimentações do sistema, da mais recente para a mais antiga. */
	@Get()
	@ApiOkResponse({ description: 'Lista paginada de movimentações.' })
	findAll(@Query() query: QueryAuditDto): Promise<Paginated<AuditLogEntry>> {
		return this.auditService.findAll(query);
	}
}
