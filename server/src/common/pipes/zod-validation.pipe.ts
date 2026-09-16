import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

/**
 * Valida input com um schema Zod.
 * Alternativa ao ValidationPipe global quando o DTO não é uma classe.
 * Uso: `@Body(new ZodValidationPipe(CreateUserSchema)) body: CreateUser`
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
	constructor(private readonly schema: ZodType<T>) {}

	transform(value: unknown): T {
		const result = this.schema.safeParse(value);

		if (!result.success) {
			throw new BadRequestException({
				message: result.error.issues.map(
					(issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`,
				),
			});
		}

		return result.data;
	}
}
