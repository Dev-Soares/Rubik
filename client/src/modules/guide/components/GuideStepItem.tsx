import type { GuideStep } from '@/modules/guide/types/guide';

type GuideStepItemProps = {
	step: GuideStep;
	index: number;
};

export function GuideStepItem({ step, index }: GuideStepItemProps) {
	return (
		<li className="flex gap-4">
			<span className="border-primary/30 text-primary flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold tabular-nums">
				{index + 1}
			</span>

			<div className="flex min-w-0 flex-col gap-1 pt-0.5">
				<h4 className="text-sm font-bold">{step.title}</h4>
				<p className="text-muted-foreground text-sm text-pretty">{step.description}</p>
			</div>
		</li>
	);
}
