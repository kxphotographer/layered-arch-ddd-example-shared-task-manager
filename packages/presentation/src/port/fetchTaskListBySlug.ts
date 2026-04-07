import type {
	Task,
	TaskList,
	TaskListSlug,
	User,
	UserSlug,
} from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-domain";
import type { Result } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-util";

export type FetchTaskListBySlug = (
	params: Readonly<{
		currentUserSlug: UserSlug;
		taskListSlug: TaskListSlug;
	}>,
) => Promise<
	Result<
		{ taskList: TaskList; tasks: Task[]; users: User[] },
		{ kind: "notFound" } | { kind: "permissionDenied" }
	>
>;
