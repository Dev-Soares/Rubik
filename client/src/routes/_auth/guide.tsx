import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { Guide } from '@/pages/Guide';

const searchSchema = z.object({
	section: z.string().optional(),
});

export const Route = createFileRoute('/_auth/guide')({
	validateSearch: searchSchema,
	component: Guide,
});
