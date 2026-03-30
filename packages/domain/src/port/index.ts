import type { FetchIfUserCredentialEmailAlreadyUsed } from "./fetchIfUserCredentialEmailAlreadyUsed";

type _Port<Transaction> = Readonly<{
	comparePassword: (
		params: Readonly<{ password: string; passwordHash: string }>,
	) => Promise<boolean>;
	fetchIfUserCredentialEmailAlreadyUsed: FetchIfUserCredentialEmailAlreadyUsed<Transaction>;
	generateSlug: () => string;
	getCurrentDate: () => Date;
	hashPassword: (password: string) => Promise<string>;
}>;

export type Port<
	Transaction,
	Key extends keyof _Port<Transaction> = keyof _Port<Transaction>,
> = Pick<_Port<Transaction>, Key>;
