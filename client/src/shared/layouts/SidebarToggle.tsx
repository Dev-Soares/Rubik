import { MenuIcon, XIcon } from 'lucide-react';
import { cn } from 'cn';
import { Button } from '@/shared/components/ui/button';
import { useSidebar } from '@/shared/components/ui/sidebar';

type SidebarToggleProps = {
	className?: string;
};

/**
 * Abre e fecha a sidebar. Os dois ícones ficam empilhados e alternam com
 * rotação + fade, acompanhando a sidebar que entra e sai.
 */
export function SidebarToggle({ className }: SidebarToggleProps) {
	const { state, isMobile, openMobile, toggleSidebar } = useSidebar();

	const isOpen = isMobile ? openMobile : state === 'expanded';

	return (
		<Button
			variant="ghost"
			size="icon"
			className={cn('size-11', className)}
			onClick={toggleSidebar}
			aria-label={isOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'}
			aria-expanded={isOpen}
		>
			<span className="relative flex size-6 items-center justify-center">
				<MenuIcon
					aria-hidden
					className={cn(
						'absolute size-6 transition-all duration-200',
						isOpen ? 'scale-75 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100',
					)}
				/>
				<XIcon
					aria-hidden
					className={cn(
						'absolute size-6 transition-all duration-200',
						isOpen ? 'scale-100 rotate-0 opacity-100' : 'scale-75 -rotate-90 opacity-0',
					)}
				/>
			</span>
		</Button>
	);
}
