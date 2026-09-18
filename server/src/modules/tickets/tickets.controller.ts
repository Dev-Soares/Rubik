import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UploadedFiles,
	UseFilters,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
	ApiBody,
	ApiConsumes,
	ApiCreatedResponse,
	ApiHeader,
	ApiOkResponse,
	ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiKeyGuard } from 'src/common/guards';
import { UpdateTicketStatusDto } from 'src/modules/tickets/dto/update-ticket-status.dto';
import { QueryTicketsDto } from 'src/modules/tickets/dto/query-tickets.dto';
import type { Paginated } from 'src/common/types/pagination.types';
import type { User } from 'src/modules/auth/types/auth.types';
import { CreateTicketDto } from 'src/modules/tickets/dto/create-ticket.dto';
import { MulterExceptionFilter } from 'src/modules/tickets/filters/multer-exception.filter';
import { TicketsService } from 'src/modules/tickets/tickets.service';
import {
	MAX_PHOTO_BYTES,
	MAX_TICKET_PHOTOS,
	type TicketCounts,
	type TicketEntry,
	type UnseenResolvedCount,
} from 'src/modules/tickets/types/ticket.types';
import { toUploadedPhotos } from 'src/modules/tickets/utils';

/**
 * Sem `ScreensGuard`: a aba é geral, como a de "Como usar" — todo usuário
 * autenticado abre chamado e lê os de todos. O `AuthGuard` global já garante
 * a sessão.
 *
 * Não há rota de edição nem de remoção: o chamado nasce e é lido.
 */
@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
	constructor(private readonly ticketsService: TicketsService) {}

	/** Lista os chamados, do mais recente para o mais antigo. */
	@Get()
	@ApiOkResponse({ description: 'Lista paginada de chamados.' })
	findAll(@Query() query: QueryTicketsDto): Promise<Paginated<TicketEntry>> {
		return this.ticketsService.findAll(query);
	}

	/**
	 * Quantos chamados do usuário foram resolvidos e ele ainda não viu.
	 * Alimenta o aviso ao lado do item na barra lateral.
	 */
	@Get('unseen-resolved')
	@ApiOkResponse({ description: 'Chamados resolvidos ainda não vistos.' })
	async countUnseenResolved(@CurrentUser('id') userId: string): Promise<UnseenResolvedCount> {
		return { count: await this.ticketsService.countUnseenResolvedForUser(userId) };
	}

	/** Zera o aviso: marca como vistos os chamados resolvidos do usuário. */
	@Patch('seen')
	@ApiOkResponse({ description: 'Chamados resolvidos marcados como vistos.' })
	async markSeen(@CurrentUser('id') userId: string): Promise<{ marked: number }> {
		return { marked: await this.ticketsService.markResolvedSeenForUser(userId) };
	}

	/** Quantos chamados há em cada status. Alimenta os contadores das abas. */
	@Get('counts')
	@ApiOkResponse({ description: 'Quantidade de chamados por status.' })
	countByStatus(): Promise<TicketCounts> {
		return this.ticketsService.countByStatus();
	}

	/**
	 * Um chamado pelo id. A tela usa ao abrir por `?ticket=<id>`, vindo da
	 * notificação: sem saber o status, não dá para escolher a aba certa.
	 *
	 * Declarada depois das rotas fixas (`counts`, `unseen-resolved`): `:id`
	 * casaria com elas e as capturaria como id.
	 */
	@Get(':id')
	@ApiOkResponse({ description: 'Chamado encontrado.' })
	findOne(@Param('id') id: string): Promise<TicketEntry> {
		return this.ticketsService.findOne(id);
	}

	/**
	 * Muda o status do chamado. É a rota da integração de atendimento: serviço
	 * externo não tem sessão, então `@Public()` tira do `AuthGuard` global e o
	 * `ApiKeyGuard` exige a chave em `x-api-key`.
	 */
	@Patch(':id/status')
	@Public()
	@UseGuards(ApiKeyGuard)
	@ApiHeader({ name: 'x-api-key', description: 'Chave da integração.', required: true })
	@ApiOkResponse({ description: 'Status atualizado.' })
	updateStatus(@Param('id') id: string, @Body() dto: UpdateTicketStatusDto): Promise<TicketEntry> {
		return this.ticketsService.updateStatus(id, dto.status);
	}

	/**
	 * Abre um chamado. `multipart/form-data`: `title` mais até
	 * `MAX_TICKET_PHOTOS` arquivos no campo `photos`.
	 *
	 * O `FilesInterceptor` aplica o teto de quantidade e de tamanho; o tipo é
	 * conferido aqui pelo mime real de cada arquivo, antes de qualquer upload.
	 */
	@Post()
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			required: ['title'],
			properties: {
				title: { type: 'string', maxLength: 120 },
				photos: {
					type: 'array',
					maxItems: MAX_TICKET_PHOTOS,
					items: { type: 'string', format: 'binary' },
				},
			},
		},
	})
	@ApiCreatedResponse({ description: 'Chamado criado.' })
	@UseFilters(MulterExceptionFilter)
	@UseInterceptors(
		FilesInterceptor('photos', MAX_TICKET_PHOTOS, { limits: { fileSize: MAX_PHOTO_BYTES } }),
	)
	create(
		@Body() dto: CreateTicketDto,
		@UploadedFiles() files: Express.Multer.File[] | undefined,
		@CurrentUser() user: User,
	): Promise<TicketEntry> {
		return this.ticketsService.create({
			title: dto.title,
			userId: user.id,
			userName: user.name,
			photos: toUploadedPhotos(files ?? []),
		});
	}
}
