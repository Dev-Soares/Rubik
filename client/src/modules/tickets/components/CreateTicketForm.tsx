import { zodResolver } from '@hookform/resolvers/zod';
import { TicketIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { TicketPhotoPicker } from '@/modules/tickets/components/TicketPhotoPicker';
import { useCreateTicket } from '@/modules/tickets/hooks/useCreateTicket';
import { ticketFormSchema, type TicketFormInput } from '@/modules/tickets/types/ticket';
import { FormError } from '@/shared/components/FormError';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/ui/button';
import { DialogClose, DialogFooter } from '@/shared/components/ui/dialog';

type CreateTicketFormProps = {
	onCreated?: () => void;
};

export function CreateTicketForm({ onCreated }: CreateTicketFormProps) {
	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<TicketFormInput>({
		resolver: zodResolver(ticketFormSchema),
		defaultValues: { title: '', photos: [] },
	});

	const {
		mutate: createTicket,
		isPending,
		error,
	} = useCreateTicket(() => {
		reset({ title: '', photos: [] });
		onCreated?.();
	});

	return (
		<form onSubmit={handleSubmit((data) => createTicket(data))} className="flex flex-col gap-6">
			<fieldset disabled={isPending} className="contents">
				<FormField
					label="Título"
					icon={TicketIcon}
					placeholder="Descreva o problema em uma frase"
					autoFocus
					error={errors.title?.message}
					{...register('title')}
				/>

				{/* Input de arquivo não é campo nativo controlável: precisa de Controller. */}
				<Controller
					control={control}
					name="photos"
					render={({ field }) => (
						<TicketPhotoPicker
							photos={field.value}
							disabled={isPending}
							error={errors.photos?.message}
							onChange={field.onChange}
						/>
					)}
				/>

				<FormError message={error?.message} />

				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="ghost">
							Cancelar
						</Button>
					</DialogClose>
					<Button type="submit" disabled={isPending}>
						{isPending ? 'Enviando...' : 'Abrir chamado'}
					</Button>
				</DialogFooter>
			</fieldset>
		</form>
	);
}
