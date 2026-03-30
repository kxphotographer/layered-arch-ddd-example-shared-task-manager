import { authenticateUserWithEmailAndPassword } from "./authenticateUser";
import { newUser } from "./newUser";

export const domainServices = <Transaction>(
	injected: Parameters<
		typeof authenticateUserWithEmailAndPassword<Transaction>
	>[0] &
		Parameters<typeof newUser<Transaction>>[0],
) => ({
	authenticateUserWithEmailAndPassword:
		authenticateUserWithEmailAndPassword(injected),
	newUser: newUser(injected),
});

type _DomainService<Transaction> = ReturnType<
	typeof domainServices<Transaction>
>;

export type DomainService<
	Transaction,
	Key extends
		keyof _DomainService<Transaction> = keyof _DomainService<Transaction>,
> = Pick<_DomainService<Transaction>, Key>;
