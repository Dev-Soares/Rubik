import * as React from 'react';
import { cn } from 'cn';
import { Dialog as DialogPrimitive } from 'radix-ui';

import { Button } from '@/shared/components/ui/button';
import { XIcon, type LucideIcon } from 'lucide-react';

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
	return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
	return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
	return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
	return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
	return (
		<DialogPrimitive.Overlay
			data-slot="dialog-overlay"
			className={cn(
				'fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
				className,
			)}
			{...props}
		/>
	);
}

function DialogContent({
	className,
	children,
	showCloseButton = true,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
	showCloseButton?: boolean;
}) {
	return (
		<DialogPortal>
			<DialogOverlay />
			<DialogPrimitive.Content
				data-slot="dialog-content"
				className={cn(
					// Coluna com teto de altura, `overflow-hidden` e sem padding: quem
					// rola é só o `DialogBody` (`min-h-0 flex-1 overflow-y-auto`).
					// Cabeçalho e rodapé ficam `shrink-0` fora da área rolante, e por
					// isso não precisam de `sticky` — eles não rolam porque não estão
					// dentro do que rola. O padding mora em cada peça, senão as faixas
					// de cabeçalho e rodapé não encostam na borda do modal.
					'fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl bg-popover text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
					className,
				)}
				{...props}
			>
				{children}
				{showCloseButton && (
					<DialogPrimitive.Close data-slot="dialog-close" asChild>
						{/*
						 * `absolute` sobre a faixa do cabeçalho: o container não rola
						 * (quem rola é o `DialogBody`), então o botão fica parado sem
						 * truque. O `pr-14` do cabeçalho reserva o espaço dele.
						 */}
						<Button
							variant="ghost"
							className="text-destructive hover:text-destructive hover:bg-destructive/10 absolute top-4 right-4 z-10"
							size="icon"
							aria-label="Fechar"
						>
							<XIcon className="size-5" />
						</Button>
					</DialogPrimitive.Close>
				)}
			</DialogPrimitive.Content>
		</DialogPortal>
	);
}

function DialogHeader({
	className,
	icon: Icon,
	children,
	...props
}: React.ComponentProps<'div'> & {
	/** Ícone do assunto do modal, num quadro à esquerda do título. */
	icon?: LucideIcon;
}) {
	return (
		// `shrink-0`: fora da área rolante, fica parado sem precisar de `sticky`.
		// `pr-14` reserva o lugar do botão de fechar, que flutua sobre esta faixa.
		<div
			data-slot="dialog-header"
			// `items-start` + `mt-0.5` no quadro do ícone: alinha o ícone pela
			// primeira linha do título, não pelo centro do bloco. Centrar quebrava
			// com descrição de duas linhas (o ícone descia para o meio do texto);
			// alinhar pelo topo com o nudge atende também o caso de linha única,
			// em que metade dos modais tem a descrição `sr-only`.
			className={cn('flex shrink-0 items-start gap-3 px-6 pt-6 pr-14 pb-3', className)}
			{...props}
		>
			{Icon ? (
				<span className="bg-primary/10 text-primary mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg">
					<Icon className="size-4.5" strokeWidth={2.5} />
				</span>
			) : null}

			<div className="flex min-w-0 flex-1 flex-col gap-1">{children}</div>
		</div>
	);
}

/**
 * O miolo que rola; o cabeçalho e o rodapé ficam parados.
 *
 * `min-h-0` é obrigatório: um filho de flex não encolhe abaixo do conteúdo por
 * padrão, então sem ele o corpo empurra o modal para além do `max-h` e quem
 * rola passa a ser a página.
 */
function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="dialog-body"
			className={cn('flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-4', className)}
			{...props}
		/>
	);
}

function DialogFooter({
	className,
	showCloseButton = false,
	children,
	...props
}: React.ComponentProps<'div'> & {
	showCloseButton?: boolean;
}) {
	return (
		<div
			data-slot="dialog-footer"
			className={cn(
				// `shrink-0`: fora da área rolante, fica parado sem precisar de
				// `sticky`. Sem fundo nem borda próprios — a faixa cinza destoava do
				// resto do modal; o respiro do `pt` já separa dos campos.
				'flex shrink-0 flex-col-reverse gap-2 px-6 pt-4 pb-6 sm:flex-row sm:justify-end',
				className,
			)}
			{...props}
		>
			{children}
			{showCloseButton && (
				<DialogPrimitive.Close asChild>
					<Button variant="outline">Close</Button>
				</DialogPrimitive.Close>
			)}
		</div>
	);
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
	return (
		<DialogPrimitive.Title
			data-slot="dialog-title"
			className={cn('text-base leading-none font-medium', className)}
			{...props}
		/>
	);
}

function DialogDescription({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
	return (
		<DialogPrimitive.Description
			data-slot="dialog-description"
			className={cn(
				'text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground',
				className,
			)}
			{...props}
		/>
	);
}

export {
	Dialog,
	DialogBody,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
};
