import { BadRequestException } from '@nestjs/common';
import {
	ALLOWED_PHOTO_TYPES,
	MAX_PHOTO_BYTES,
	MAX_TICKET_PHOTOS,
	type AllowedPhotoType,
	type UploadedPhoto,
} from 'src/modules/tickets/types/ticket.types';

/** Extensão do objeto no bucket, pelo tipo declarado. */
const EXTENSION_BY_TYPE: Record<AllowedPhotoType, string> = {
	'image/jpeg': '.jpg',
	'image/png': '.png',
	'image/webp': '.webp',
};

export function isAllowedPhotoType(contentType: string): contentType is AllowedPhotoType {
	return ALLOWED_PHOTO_TYPES.includes(contentType as AllowedPhotoType);
}

/**
 * A extensão é só cosmética para quem abrir o bucket — quem determina o tipo
 * na entrega é o `ContentType` do objeto. Tipo desconhecido não chega aqui:
 * `isAllowedPhotoType` barra antes, na fronteira.
 */
export function extensionFor(contentType: string): string {
	return isAllowedPhotoType(contentType) ? EXTENSION_BY_TYPE[contentType] : '';
}

/**
 * Valida o tipo de cada arquivo na fronteira e converte para o formato que o
 * service consome — ele não conhece `Express.Multer.File`.
 */
export function toUploadedPhotos(files: Express.Multer.File[]): UploadedPhoto[] {
	return files.map((file) => {
		if (!isAllowedPhotoType(file.mimetype)) {
			throw new BadRequestException(
				`Formato de imagem não aceito. Use ${ALLOWED_PHOTO_TYPES.join(', ')}.`,
			);
		}

		return { buffer: file.buffer, contentType: file.mimetype };
	});
}

const BYTES_PER_MB = 1024 * 1024;

/**
 * Mensagens que o `@nestjs/platform-express` produz ao converter um
 * `MulterError` em `HttpException` — o texto original do multer, em inglês,
 * às vezes com ` - <campo>` no fim.
 *
 * Casamos pelo texto porque a conversão do Nest descarta o `code` do erro:
 * quando o filtro o recebe, só resta a mensagem. Importar `MulterError` para
 * ler o `code` antes disso não resolve — o `multer` é dependência transitiva,
 * e depender dele direto quebraria na próxima troca de versão do Nest.
 */
const PHOTO_ERROR_MESSAGES: Record<string, string> = {
	'File too large': `Cada foto deve ter no máximo ${MAX_PHOTO_BYTES / BYTES_PER_MB} MB.`,
	'Too many files': `Anexe no máximo ${MAX_TICKET_PHOTOS} fotos.`,
	'Unexpected field': `Anexe no máximo ${MAX_TICKET_PHOTOS} fotos.`,
};

/**
 * Traduz a mensagem do multer para pt-BR. Devolve `null` quando o erro não é
 * de upload, para o chamador deixá-lo seguir sem alteração.
 */
export function toPhotoErrorMessage(message: string): string | null {
	// O Nest acrescenta ` - <campo>` quando o erro nomeia o campo.
	const [reason] = message.split(' - ');
	return reason ? (PHOTO_ERROR_MESSAGES[reason] ?? null) : null;
}
