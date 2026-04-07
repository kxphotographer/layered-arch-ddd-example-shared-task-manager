import type { AuthenticateUserWithEmailAndPassword } from "./authenticateUserWithEmailAndPassword";
import type { FetchManyTaskListsForUser } from "./fetchManyTaskListsForUser";
import type { FetchTaskListBySlug } from "./fetchTaskListBySlug";

export type {
	AuthenticateUserWithEmailAndPassword,
	FetchManyTaskListsForUser,
	FetchTaskListBySlug,
};

type _Port = Readonly<{
	authenticateUserWithEmailAndPassword: AuthenticateUserWithEmailAndPassword;
	fetchManyTaskListsForUser: FetchManyTaskListsForUser;
	fetchTaskListBySlug: FetchTaskListBySlug;
	getCurrentDate: () => Date;
	jwtSecret: string;
}>;

export type Port<Key extends keyof _Port = keyof _Port> = Pick<_Port, Key>;
