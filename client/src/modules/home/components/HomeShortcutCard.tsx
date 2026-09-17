import { Link } from '@tanstack/react-router';
import { ArrowRightIcon } from 'lucide-react';
import type { HomeShortcut } from '@/modules/home/types/home';
import { Card, CardContent } from '@/shared/components/ui/card';

type HomeShortcutCardProps = {
	shortcut: HomeShortcut;
};

export function HomeShortcutCard({ shortcut }: HomeShortcutCardProps) {
	const Icon = shortcut.icon;

	return (
		<Link
			to={shortcut.to}
			className="group focus-visible:ring-ring/50 cursor-pointer rounded-xl outline-none focus-visible:ring-3"
		>
			<Card className="group-hover:border-primary/40 h-full transition-colors">
				<CardContent className="flex items-center gap-4">
					<span className="bg-primary/10 text-primary group-hover:bg-primary/15 flex size-11 shrink-0 items-center justify-center rounded-lg transition-colors">
						<Icon className="size-5" />
					</span>

					<span className="flex min-w-0 flex-col">
						{shortcut.group ? (
							<span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
								{shortcut.group}
							</span>
						) : null}
						<span className="truncate font-bold tracking-tight">{shortcut.label}</span>
					</span>

					{/* A seta desliza no hover: reforça que o card inteiro é o link. */}
					<ArrowRightIcon className="text-muted-foreground group-hover:text-primary ml-auto size-4 shrink-0 transition-all group-hover:translate-x-0.5" />
				</CardContent>
			</Card>
		</Link>
	);
}
