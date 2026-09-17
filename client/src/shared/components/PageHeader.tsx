type PageHeaderProps = {
	title: string;
	description?: string;
};

/** Título da página: na cor primária, com descrição opcional abaixo. */
export function PageHeader({ title, description }: PageHeaderProps) {
	return (
		<header className="flex flex-col gap-1">
			<h1 className="text-primary text-3xl font-black tracking-tight">{title}</h1>
			{description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
		</header>
	);
}
