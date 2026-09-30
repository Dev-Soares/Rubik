import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorPage } from '@/pages/ErrorPage';
import { logError } from '@/shared/utils/logger';

type Props = { children: ReactNode };
type State = { error: unknown };

/**
 * Última rede de segurança do app.
 *
 * O `errorComponent` do TanStack Router pega o que estoura durante loader e
 * render de rota. O que estoura depois — um handler de evento assíncrono, um
 * render disparado por state de componente já montado — passa por fora dele e
 * derruba a árvore inteira, deixando tela branca. Este boundary fecha isso.
 *
 * Precisa ser classe: React não expõe `componentDidCatch` em função.
 */
export class AppErrorBoundary extends Component<Props, State> {
	state: State = { error: null };

	static getDerivedStateFromError(error: unknown): State {
		return { error };
	}

	componentDidCatch(error: Error, info: ErrorInfo): void {
		logError('erro não capturado no render', error, { componentStack: info.componentStack });
	}

	private readonly reset = (): void => {
		this.setState({ error: null });
	};

	render(): ReactNode {
		if (this.state.error !== null) {
			return <ErrorPage error={this.state.error} reset={this.reset} />;
		}

		return this.props.children;
	}
}
