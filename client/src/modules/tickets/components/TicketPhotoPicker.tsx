import { ImagePlusIcon, XIcon } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { ALLOWED_PHOTO_TYPES, MAX_TICKET_PHOTOS } from '@/modules/tickets/types/ticket';
import { imagesFromClipboard, mergePhotos } from '@/modules/tickets/utils';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';

type TicketPhotoPickerProps = {
	photos: File[];
	disabled?: boolean;
	error?: string;
	onChange: (photos: File[]) => void;
};

/**
 * Seletor de fotos com miniatura e remoção. O `<input type="file">` fica
 * escondido atrás do botão: estilizá-lo diretamente não é possível de forma
 * consistente entre navegadores.
 */
export function TicketPhotoPicker({
	photos,
	disabled,
	error,
	onChange,
}: TicketPhotoPickerProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const inputId = useId();
	const isFull = photos.length >= MAX_TICKET_PHOTOS;

	/* O listener é registrado uma vez; a ref entrega o estado atual a ele sem
	 * precisar reassinar o evento a cada foto adicionada. */
	const latest = useRef({ photos, onChange, disabled });
	latest.current = { photos, onChange, disabled };

	/**
	 * Colar com Ctrl+V em qualquer ponto do diálogo. O ouvinte fica no
	 * `document` porque a área de colagem é o formulário inteiro, não um campo:
	 * exigir foco em um alvo específico é justamente o que faz o usuário achar
	 * que colar não funciona.
	 */
	useEffect(() => {
		function handlePaste(event: ClipboardEvent) {
			const { photos: current, onChange: notify, disabled: isDisabled } = latest.current;

			if (isDisabled || current.length >= MAX_TICKET_PHOTOS) {
				return;
			}

			const images = imagesFromClipboard(event.clipboardData);
			if (images.length === 0) {
				return;
			}

			// Só impede o comportamento padrão quando há imagem: colar texto no
			// campo de título precisa continuar funcionando.
			event.preventDefault();
			notify(mergePhotos(current, images, MAX_TICKET_PHOTOS));
		}

		document.addEventListener('paste', handlePaste);
		return () => document.removeEventListener('paste', handlePaste);
	}, []);

	return (
		<div className="flex flex-col gap-2">
			<Label
				htmlFor={inputId}
				className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
			>
				Fotos (opcional)
			</Label>

			{photos.length > 0 ? (
				<ul className="grid grid-cols-3 gap-2">
					{photos.map((photo, index) => (
						/* O índice entra na chave porque imagem colada chega sempre como
						 * `image.png`: só nome e data não distinguem dois prints. */
						<li key={`${index}-${photo.name}-${photo.lastModified}`} className="relative">
							<img
								src={URL.createObjectURL(photo)}
								alt={`Foto ${index + 1} de ${photos.length}`}
								className="aspect-square w-full rounded-lg border object-cover"
								/* Libera o blob assim que o navegador decodifica a imagem:
								 * sem isto cada troca de seleção vaza memória até o reload. */
								onLoad={(event) => URL.revokeObjectURL(event.currentTarget.src)}
							/>
							<Button
								type="button"
								variant="secondary"
								size="icon"
								aria-label={`Remover foto ${index + 1}`}
								disabled={disabled}
								className="absolute top-1 right-1 size-7"
								onClick={() => onChange(photos.filter((current) => current !== photo))}
							>
								<XIcon className="size-3.5" />
							</Button>
						</li>
					))}
				</ul>
			) : null}

			<input
				id={inputId}
				ref={inputRef}
				type="file"
				multiple
				accept={ALLOWED_PHOTO_TYPES.join(',')}
				disabled={disabled || isFull}
				className="sr-only"
				onChange={(event) => {
					onChange(mergePhotos(photos, [...(event.target.files ?? [])], MAX_TICKET_PHOTOS));
					// Zera para que escolher o mesmo arquivo de novo dispare o evento.
					event.target.value = '';
				}}
			/>

			<Button
				type="button"
				variant="outline"
				disabled={disabled || isFull}
				className="h-11 justify-start"
				onClick={() => inputRef.current?.click()}
			>
				<ImagePlusIcon />
				{isFull ? `Limite de ${MAX_TICKET_PHOTOS} fotos atingido` : 'Adicionar foto'}
			</Button>

			{error ? (
				<span role="alert" className="text-destructive text-xs">
					{error}
				</span>
			) : (
				<span className="text-muted-foreground text-xs">
					Cole uma imagem com Ctrl+V ou escolha o arquivo. Até {MAX_TICKET_PHOTOS} imagens JPG, PNG
					ou WEBP, de no máximo 5 MB cada.
				</span>
			)}
		</div>
	);
}
