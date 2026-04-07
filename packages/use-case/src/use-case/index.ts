import { authenticateUserWithEmailAndPassword } from "./authenticateUserWithEmailAndPassword";
import { fetchManyTaskListsForUser } from "./fetchManyTaskListsForUser";

export const useCases = <Transaction>(
	injected: Parameters<
		typeof authenticateUserWithEmailAndPassword<Transaction>
	>[0] &
		Parameters<typeof fetchManyTaskListsForUser<Transaction>>[0],
) => ({
	authenticateUserWithEmailAndPassword:
		authenticateUserWithEmailAndPassword<Transaction>(injected),
	fetchManyTaskListsForUser: fetchManyTaskListsForUser<Transaction>(injected),
});
