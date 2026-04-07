import type { FetchManyTaskListsForUser } from "./fetchManyTaskListsForUser";
import type { FetchUserByEmail } from "./fetchUserByEmail";

export type { FetchManyTaskListsForUser, FetchUserByEmail };

type _Port<Transaction> = Readonly<{
	fetchManyTaskListsForUser: FetchManyTaskListsForUser<Transaction>;
	fetchUserByEmail: FetchUserByEmail<Transaction>;
}>;

export type Port<
	Transaction,
	Key extends keyof _Port<Transaction> = keyof _Port<Transaction>,
> = Pick<_Port<Transaction>, Key>;
