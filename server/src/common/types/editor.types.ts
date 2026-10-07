/**
 * Quem fez a chamada, para as regras que dependem de quem edita quem.
 *
 * Mora em `common/` porque dois módulos decidem com ela: `users` (quem pode
 * trocar o cargo de quem) e `roles` (quem pode mexer nas exceções de permissão
 * de quem). As duas regras precisam da mesma informação, e são o mesmo assunto:
 * impedir que alguém amplie o próprio acesso.
 */
export type Editor = {
	id: string;
	role: string | null;
};
