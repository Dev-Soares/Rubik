import { randomUUID } from 'node:crypto';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import {
	DeleteObjectsCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env, isStorageEnabled } from 'src/config/env';
import { extensionFor } from 'src/modules/tickets/utils';
import type { UploadedPhoto } from 'src/modules/tickets/types/ticket.types';

/**
 * Acesso ao bucket. Isolado do `TicketsService` porque é a única parte do
 * módulo que fala com fora do processo: o service cuida da regra e do banco,
 * este cuida de objeto e URL assinada.
 *
 * O bucket é privado — nada é servido por URL pública. A leitura sai sempre
 * como URL assinada de vida curta (`S3_SIGNED_URL_TTL`), gerada na hora da
 * listagem, e por isso a URL nunca é gravada em `ticket_photo`.
 *
 * Sem `S3_*` configurado o storage fica desligado: `enabled` é false, o
 * controller recusa foto com uma mensagem clara e o resto do módulo funciona.
 * É o default do template — nenhuma credencial de nuvem para rodar local.
 */
@Injectable()
export class TicketStorageService {
	/** O módulo de chamados consulta isto antes de aceitar foto. */
	readonly enabled = isStorageEnabled;

	// `null` quando desligado: instanciar o SDK sem credencial só adiaria o erro
	// para o primeiro upload, com mensagem de credencial inválida.
	private readonly client = isStorageEnabled
		? new S3Client({
				region: env.S3_REGION,
				credentials: {
					accessKeyId: env.S3_ACCESS_KEY_ID,
					secretAccessKey: env.S3_SECRET_ACCESS_KEY,
				},
				// `endpoint: undefined` deixa o SDK resolver o host da AWS sozinho.
				endpoint: env.S3_ENDPOINT || undefined,
				forcePathStyle: env.S3_FORCE_PATH_STYLE,
			})
		: null;

	private requireClient(): S3Client {
		if (!this.client) {
			throw new ServiceUnavailableException(
				'Armazenamento de fotos não configurado neste ambiente.',
			);
		}
		return this.client;
	}

	/** Sobe a foto e devolve a chave do objeto para gravar no banco. */
	async upload(ticketId: string, photo: UploadedPhoto): Promise<string> {
		const key = `tickets/${ticketId}/${randomUUID()}${extensionFor(photo.contentType)}`;

		await this.requireClient().send(
			new PutObjectCommand({
				Bucket: env.S3_BUCKET,
				Key: key,
				Body: photo.buffer,
				ContentType: photo.contentType,
			}),
		);

		return key;
	}

	/** URL temporária de leitura. Expira em `S3_SIGNED_URL_TTL` segundos. */
	signedUrl(key: string): Promise<string> {
		return getSignedUrl(
			this.requireClient(),
			new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }),
			{ expiresIn: env.S3_SIGNED_URL_TTL },
		);
	}

	/**
	 * Remove objetos órfãos. Usado quando o INSERT falha depois do upload: sem
	 * isso o bucket acumula foto que nenhuma linha referencia.
	 */
	async deleteMany(keys: string[]): Promise<void> {
		if (keys.length === 0) {
			return;
		}

		await this.requireClient().send(
			new DeleteObjectsCommand({
				Bucket: env.S3_BUCKET,
				Delete: { Objects: keys.map((Key) => ({ Key })) },
			}),
		);
	}
}
