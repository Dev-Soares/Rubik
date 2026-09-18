import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import {
	DeleteObjectsCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from 'src/config/env';
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
 */
@Injectable()
export class TicketStorageService {
	private readonly client = new S3Client({
		region: env.S3_REGION,
		credentials: {
			accessKeyId: env.S3_ACCESS_KEY_ID,
			secretAccessKey: env.S3_SECRET_ACCESS_KEY,
		},
		// `endpoint: undefined` deixa o SDK resolver o host da AWS sozinho.
		endpoint: env.S3_ENDPOINT || undefined,
		forcePathStyle: env.S3_FORCE_PATH_STYLE,
	});

	/** Sobe a foto e devolve a chave do objeto para gravar no banco. */
	async upload(ticketId: string, photo: UploadedPhoto): Promise<string> {
		const key = `tickets/${ticketId}/${randomUUID()}${extensionFor(photo.contentType)}`;

		await this.client.send(
			new PutObjectCommand({
				Bucket: env.S3_BUCKET,
				Key: key,
				Body: photo.buffer,
				ContentType: photo.contentType,
			}),
		);

		return key;
	}

	/**
	 * Cliente usado só para assinar leitura. Separado porque a assinatura
	 * embute o host: dentro do compose o server fala com `minio:9000`, e uma
	 * URL assinada com esse host não abre no navegador. Assinar já com o host
	 * público mantém a assinatura válida — trocar o host depois a invalidaria.
	 */
	private readonly readClient = env.S3_PUBLIC_ENDPOINT
		? new S3Client({
				region: env.S3_REGION,
				credentials: {
					accessKeyId: env.S3_ACCESS_KEY_ID,
					secretAccessKey: env.S3_SECRET_ACCESS_KEY,
				},
				endpoint: env.S3_PUBLIC_ENDPOINT,
				forcePathStyle: env.S3_FORCE_PATH_STYLE,
			})
		: this.client;

	/** URL temporária de leitura. Expira em `S3_SIGNED_URL_TTL` segundos. */
	signedUrl(key: string): Promise<string> {
		return getSignedUrl(
			this.readClient,
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

		await this.client.send(
			new DeleteObjectsCommand({
				Bucket: env.S3_BUCKET,
				Delete: { Objects: keys.map((Key) => ({ Key })) },
			}),
		);
	}
}
