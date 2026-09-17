import { cn } from 'cn';
import type { GuideGroup } from '@/modules/guide/types/guide';

type GuideNavProps = {
	groups: GuideGroup[];
	activeId: string;
	onSelect: (id: string) => void;
};

/** Índice do guia: categorias em caixa alta, seções como itens selecionáveis. */
export function GuideNav({ groups, activeId, onSelect }: GuideNavProps) {
	return (
		<nav className="flex flex-col gap-6 lg:sticky lg:top-20 lg:max-h-[calc(100svh-6rem)] lg:overflow-y-auto">
			{groups.map((group) => (
				<div key={group.label} className="flex flex-col gap-1">
					<span className="text-muted-foreground px-3 pb-1 text-xs font-bold tracking-wider uppercase">
						{group.label}
					</span>

					{group.sections.map((section) => (
						<button
							key={section.id}
							type="button"
							onClick={() => onSelect(section.id)}
							aria-current={section.id === activeId ? 'true' : undefined}
							className={cn(
								'flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
								section.id === activeId
									? 'bg-primary text-primary-foreground font-bold'
									: 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground'
							)}
						>
							<section.icon className="size-4 shrink-0" />
							<span className="truncate">{section.label}</span>
						</button>
					))}
				</div>
			))}
		</nav>
	);
}
