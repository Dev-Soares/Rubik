import { Global, Module, type OnApplicationShutdown } from '@nestjs/common';
import { DB, db, queryClient } from 'src/db/db.provider';

@Global()
@Module({
	providers: [
		{
			provide: DB,
			useValue: db,
		},
	],
	exports: [DB],
})
export class DbModule implements OnApplicationShutdown {
	async onApplicationShutdown(): Promise<void> {
		await queryClient.end({ timeout: 5 });
	}
}
