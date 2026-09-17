import { Module } from '@nestjs/common';
import { RolesModule } from 'src/modules/roles/roles.module';
import { UsersController } from 'src/modules/users/users.controller';
import { UsersService } from 'src/modules/users/users.service';

@Module({
	// O `ScreensGuard` das rotas resolve as permissões pelo `RolesService`.
	imports: [RolesModule],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
