import { ArgumentsHost, BadRequestException, Catch, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { toPhotoErrorMessage } from 'src/modules/tickets/utils';

/**
 * O multer rejeita excesso de arquivo e tamanho antes de qualquer código do
 * módulo rodar, e a mensagem dele é em inglês ("File too large") — o que
 * chegaria cru na tela do usuário. Aqui ela vira pt-BR, sempre como 400: o
 * `PayloadTooLargeException` (413) que o Nest produz para foto grande é, para
 * quem está preenchendo o formulário, o mesmo erro de campo que os demais.
 *
 * Fica no módulo, não em `common/filters/`: só as rotas que recebem upload
 * passam pelo multer.
 */
@Catch(HttpException)
export class MulterExceptionFilter extends BaseExceptionFilter {
	override catch(exception: HttpException, host: ArgumentsHost): void {
		const translated = toPhotoErrorMessage(exception.message);

		if (!translated) {
			super.catch(exception, host);
			return;
		}

		super.catch(new BadRequestException(translated), host);
	}
}
