import { BellIcon, BellOffIcon } from 'lucide-react';
import { useId } from 'react';
import {
	useSetTicketNotification,
	useTicketNotification,
} from '@/modules/tickets/hooks/useTicketNotification';
import { cn } from 'cn';

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
		/*
		 * Toggle escrito à mão, e não o `Switch` do shadcn: as classes dele fixam
		 * 32x18px por `data-[size=default]:h-[18.4px]`, especificidade maior que
		 * um `h-7 w-12` passado por `className` — o controle ficava minúsculo e
		 * sumia no fundo escuro.
		 *
		 * O botão envolve ícone, texto e trilho: clicar em qualquer ponto
		 * alterna, e o foco por teclado é um só.
		 */
		<button
			id={switchId}
			type="button"
			role="switch"
			aria-checked={enabled}
			/* Enquanto carrega a preferência, o controle mostraria "ligado" e
			 * permitiria um clique que parte do valor errado. */
			disabled={isPending || isSaving}
			onClick={() => setEnabled(!enabled)}
			className="focus-visible:ring-ring flex cursor-pointer items-center gap-3 rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
		>
			<Icon className="text-destructive size-4 shrink-0" aria-hidden />

			<span className="text-destructive text-sm font-medium">Receber avisos de chamado</span>

			<span
				className={cn(
					'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
					enabled ? 'bg-destructive' : 'bg-muted-foreground/40',
				)}
			>
				<span
					className={cn(
						'bg-background block size-4.5 rounded-full shadow-sm transition-transform',
						enabled ? 'translate-x-5.5' : 'translate-x-0.75',
					)}
				/>
			</span>
		</button>
	);
}
