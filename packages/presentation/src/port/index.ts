import type { AuthenticateUserWithEmailAndPassword } from "./authenticateUserWithEmailAndPassword";
import type { FetchTaskListForUser } from "./fetchTaskListForUser";

type _Port = Readonly<{
	authenticateUserWithEmailAndPassword: AuthenticateUserWithEmailAndPassword;
	fetchTaskListForUser: FetchTaskListForUser;
	getCurrentDate: () => Date;
	jwtSecret: string;
}>;

export type Port<Key extends keyof _Port = keyof _Port> = Pick<_Port, Key>;
