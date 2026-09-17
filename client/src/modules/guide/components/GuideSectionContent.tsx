import { Link } from '@tanstack/react-router';
import { ArrowRightIcon, InfoIcon } from 'lucide-react';
import { GuideStepItem } from '@/modules/guide/components/GuideStepItem';
import type { GuideSection } from '@/modules/guide/types/guide';
import { Button } from '@/shared/components/ui/button';

type GuideSectionContentProps = {
	section: GuideSection;
};

export function GuideSectionContent({ section }: GuideSectionContentProps) {
	return (
		<article className="flex flex-col gap-8">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="flex min-w-0 flex-col gap-1">
					<h2 className="text-2xl font-black tracking-tight">{section.title}</h2>
					<p className="text-muted-foreground text-pretty">{section.description}</p>
				</div>

				{section.to ? (
					<Button asChild variant="outline" size="sm">
						<Link to={section.to}>
							Abrir aba
							<ArrowRightIcon />
						</Link>
					</Button>
				) : null}
			</div>

			<section className="flex flex-col gap-5">
				<h3 className="text-lg font-bold tracking-tight">Passo a passo</h3>

				<ol className="flex flex-col gap-5">
					{section.steps.map((step, index) => (
						<GuideStepItem key={step.title} step={step} index={index} />
					))}
				</ol>
			</section>

			{section.note ? (
				<aside className="bg-muted/40 flex gap-3 rounded-lg border p-4">
					<InfoIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />

					<div className="flex min-w-0 flex-col gap-1">
						<h4 className="text-sm font-bold">{section.note.title}</h4>
						<p className="text-muted-foreground text-sm text-pretty">
							{section.note.description}
						</p>
					</div>
				</aside>
			) : null}
		</article>
	);
}
