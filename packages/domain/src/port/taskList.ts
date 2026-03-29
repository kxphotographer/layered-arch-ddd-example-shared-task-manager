import type { Result } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-util";
import type { TaskListSlug, UserSlug } from "@/entity";

export type FetchIfUserBelongsToTaskList = (
	taskListSlug: TaskListSlug,
	params: Readonly<{
		userSlug: UserSlug;
	}>,
) => Promise<Result<{ belongs: boolean }>>;
