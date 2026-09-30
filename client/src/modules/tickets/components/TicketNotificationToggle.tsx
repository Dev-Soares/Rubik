import { BellIcon, BellOffIcon } from 'lucide-react';
import { useId } from 'react';
import {
	useSetTicketNotification,
	useTicketNotification,
} from '@/modules/tickets/hooks/useTicketNotification';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';

/**
 * Liga e desliga os avisos de chamado deste usuário. Preferência individual:
 * desligar não afeta ninguém mais.
 *
 * Silencia só o sino. O contador na barra lateral continua, porque conta os
 * chamados do próprio usuário — quem desligou o aviso não pediu para deixar de
 * ver o que ele mesmo abriu.
 */
export function TicketNotificationToggle() {
	const switchId = useId();
	const { data, isPending } = useTicketNotification();
	const { mutate: setEnabled, isPending: isSaving } = useSetTicketNotification();

	const enabled = data?.enabled ?? true;
	const Icon = enabled ? BellIcon : BellOffIcon;

	return (
		<div className="flex items-center gap-3">
			<Icon className="text-destructive size-4 shrink-0" aria-hidden />

			<Label htmlFor={switchId} className="text-destructive text-sm font-medium">
				Receber avisos de chamado
			</Label>

			<Switch
				id={switchId}
				checked={enabled}
				/* Enquanto carrega a preferência, o controle mostraria "ligado" e
				 * permitiria um clique que parte do valor errado. */
				disabled={isPending || isSaving}
				onCheckedChange={(checked) => setEnabled(checked)}
				// Ligado acende no vermelho do rótulo; desligado fica no cinza neutro.
				// `data-checked` é o estado que o Switch do shadcn expõe.
				className="data-checked:bg-destructive **:data-[slot=switch-thumb]:size-5 h-6 w-11"
			/>
		</div>
	);
}
