import { APP_VERSION } from '@/shared/version';

/** Versão do sistema, no rodapé da sidebar. */
export function AppVersion() {
	return (
		<span className="text-primary px-2 text-xs font-semibold tabular-nums group-data-[collapsible=icon]:hidden">
			v{APP_VERSION}
		</span>
	);
}
