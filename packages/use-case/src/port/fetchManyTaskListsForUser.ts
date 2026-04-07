import type {
	TaskList,
	UserSlug,
} from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-domain";
import type { Result } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-util";

export type FetchManyTaskListsForUser<Transaction> = (
	params: Readonly<{
		transaction?: Transaction;
		userSlug: UserSlug;
	}>,
) => Promise<Result<{ taskLists: TaskList[] }>>;
