/** Quem fez a chamada, para as regras que dependem de quem edita quem. */
export type Editor = {
	id: string;
	role: string | null;
};

export type PublicUser = {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	role: string | null;
	createdAt: Date;
	updatedAt: Date;
};
