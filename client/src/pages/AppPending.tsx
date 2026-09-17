/** Carregamento inicial da aplicação, antes de qualquer layout. */
export function AppPending() {
	return (
		<div className="flex min-h-dvh items-center justify-center">
			<span
				role="status"
				aria-label="Carregando"
				className="border-muted border-t-primary size-8 animate-spin rounded-full border-4"
			/>
		</div>
	);
}
