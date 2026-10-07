/** Resposta paginada da API. O mesmo envelope em toda listagem. */
export type Paginated<TItem> = {
	items: TItem[];
	total: number;
	limit: number;
	offset: number;
};
