import { cn } from 'cn';
import { EyeIcon, MinusIcon, PencilIcon } from 'lucide-react';
import {
	SCREEN_GRANT_LABELS,
	SCREEN_GRANT_SHORT_LABELS,
	SCREEN_GRANTS,
	SCREEN_LABELS,
	type Screen,
	type ScreenGrant,
} from '@/modules/roles/types/role';
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group';

/** Ícone e cor por nível. `none` fica neutro para o que está ligado saltar à vista. */
const GRANT_STYLE: Record<ScreenGrant, { icon: typeof EyeIcon; card: string; accent: string }> = {
	none: { icon: MinusIcon, card: 'border-border', accent: 'text-muted-foreground' },
	read: { icon: EyeIcon, card: 'border-primary/30 bg-primary/5', accent: 'text-primary' },
	write: { icon: PencilIcon, card: 'border-primary/60 bg-primary/10', accent: 'text-primary' },
};

type ScreenGrantCardProps = {
	screen: Screen;
	grant: ScreenGrant;
	onChange: (grant: ScreenGrant) => void;
	disabled?: boolean;
};

/**
 * Card de uma tela com os três níveis visíveis. A grade acomoda muito mais
 * telas por altura que uma linha por tela, e manter os botões à mostra evita o
 * clique cego de um controle que cicla.
 */
export function ScreenGrantCard({ screen, grant, onChange, disabled }: ScreenGrantCardProps) {
	const style = GRANT_STYLE[grant];
	const Icon = style.icon;

	return (
		<div className={cn('flex flex-col gap-2 rounded-md border p-3 transition-colors', style.card)}>
			<span className="flex items-center gap-2">
				<Icon className={cn('size-3.5 shrink-0', style.accent)} />
				<span className="truncate text-sm font-medium">{SCREEN_LABELS[screen]}</span>
			</span>

			{/*
			 * `type="single"` devolve string vazia ao clicar na opção já marcada;
			 * ignoramos — toda tela tem um nível, não existe estado sem valor.
			 */}
			<ToggleGroup
				type="single"
				value={grant}
				onValueChange={(next) => next && onChange(next as ScreenGrant)}
				disabled={disabled}
				aria-label={SCREEN_LABELS[screen]}
				className="bg-muted/40 w-full gap-0 rounded-sm p-0.5"
			>
				{SCREEN_GRANTS.map((option) => (
					<ToggleGroupItem
						key={option}
						value={option}
						title={SCREEN_GRANT_LABELS[option]}
						aria-label={SCREEN_GRANT_LABELS[option]}
						className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary h-7 flex-1 rounded-sm border-0 px-1 text-xs font-medium transition-colors data-[state=on]:font-semibold"
					>
						{SCREEN_GRANT_SHORT_LABELS[option]}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</div>
	);
}
