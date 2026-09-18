import { cn } from 'cn';
import { EyeIcon, MinusIcon, PencilIcon, UsersIcon } from 'lucide-react';
import {
	SCREEN_ACCESS,
	SCREEN_ACCESS_LABELS,
	SCREEN_ACCESS_SHORT_LABELS,
	SCREEN_GRANT_LABELS,
	SCREEN_LABELS,
	type Screen,
	type ScreenAccess,
	type ScreenGrant,
} from '@/modules/roles/types/role';
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group';

/**
 * `inherit` fica neutro: é o estado padrão, e o que precisa saltar à vista é a
 * exceção que alguém criou. Negar usa `destructive` — tira acesso que o cargo dá.
 */
const ACCESS_STYLE: Record<ScreenAccess, { icon: typeof EyeIcon; card: string; accent: string }> = {
	inherit: { icon: UsersIcon, card: 'border-border', accent: 'text-muted-foreground' },
	none: {
		icon: MinusIcon,
		card: 'border-destructive/40 bg-destructive/5',
		accent: 'text-destructive',
	},
	read: { icon: EyeIcon, card: 'border-primary/30 bg-primary/5', accent: 'text-primary' },
	write: { icon: PencilIcon, card: 'border-primary/60 bg-primary/10', accent: 'text-primary' },
};

type UserScreenAccessCardProps = {
	screen: Screen;
	access: ScreenAccess;
	/** Nível que o cargo do usuário dá nesta tela. */
	inherited: ScreenGrant;
	onChange: (access: ScreenAccess) => void;
	disabled?: boolean;
};

export function UserScreenAccessCard({
	screen,
	access,
	inherited,
	onChange,
	disabled,
}: UserScreenAccessCardProps) {
	const style = ACCESS_STYLE[access];
	const Icon = style.icon;

	/** O `title` de "Cargo" diz o que o cargo dá, para a escolha não ser às cegas. */
	const optionLabel = (option: ScreenAccess) =>
		option === 'inherit'
			? `${SCREEN_ACCESS_LABELS.inherit} (${SCREEN_GRANT_LABELS[inherited].toLowerCase()})`
			: SCREEN_ACCESS_LABELS[option];

	return (
		<div className={cn('flex flex-col gap-2 rounded-md border p-3 transition-colors', style.card)}>
			<span className="flex items-center gap-2">
				<Icon className={cn('size-3.5 shrink-0', style.accent)} />
				<span className="truncate text-sm font-medium">{SCREEN_LABELS[screen]}</span>
			</span>

			<ToggleGroup
				type="single"
				value={access}
				onValueChange={(next) => next && onChange(next as ScreenAccess)}
				disabled={disabled}
				aria-label={SCREEN_LABELS[screen]}
				className="bg-muted/40 w-full gap-0 rounded-sm p-0.5"
			>
				{SCREEN_ACCESS.map((option) => (
					<ToggleGroupItem
						key={option}
						value={option}
						title={optionLabel(option)}
						aria-label={optionLabel(option)}
						className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary h-7 flex-1 rounded-sm border-0 px-1 text-xs font-medium transition-colors data-[state=on]:font-semibold"
					>
						{SCREEN_ACCESS_SHORT_LABELS[option]}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</div>
	);
}
