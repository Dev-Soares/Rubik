import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { cn } from 'cn';

type UserAvatarProps = {
	name: string;
	image?: string | null;
	className?: string;
};

function getInitials(name: string): string {
	return name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? '')
		.join('');
}

export function UserAvatar({ name, image, className }: UserAvatarProps) {
	return (
		<Avatar className={cn('size-10', className)}>
			{image ? <AvatarImage src={image} alt={name} /> : null}
			<AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
				{getInitials(name)}
			</AvatarFallback>
		</Avatar>
	);
}
