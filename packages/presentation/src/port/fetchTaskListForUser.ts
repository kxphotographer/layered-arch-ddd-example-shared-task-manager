import type {
	TaskList,
	UserSlug,
} from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-domain";
import type { Result } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-util";

export type FetchTaskListForUser = (
	params: Readonly<{
		userSlug: UserSlug;
	}>,
) => Promise<Result<{ taskLists: readonly TaskList[] }>>;
