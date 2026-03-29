import { UnreachableCase } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-util";
import type { Task, User } from "@/entity";
import type {
	FetchBelongingTaskListOfTask,
	FetchIfUserBelongsToTaskList,
} from "@/port";

export const isTaskVisibleToUser =
	(
		injected: Readonly<{
			fetchBelongingTaskListOfTask: FetchBelongingTaskListOfTask;
			fetchIfUserBelongsToTaskList: FetchIfUserBelongsToTaskList;
		}>,
	) =>
	async (
		task: Task,
		params: Readonly<{
			user: User;
		}>,
	) => {
		const ifUserBelongsToTaskListResult =
			await injected.fetchIfUserBelongsToTaskList(task.taskListSlug, {
				userSlug: params.user.slug,
			});
		if (!ifUserBelongsToTaskListResult.success) {
			throw new UnreachableCase(ifUserBelongsToTaskListResult.success);
		}

		return ifUserBelongsToTaskListResult.value.belongs;
	};
export type IsTaskVisibleToUser = ReturnType<typeof isTaskVisibleToUser>;

export const isTaskEditableByUser =
	(
		injected: Readonly<{
			fetchIfUserBelongsToTaskList: FetchIfUserBelongsToTaskList;
		}>,
	) =>
	async (
		task: Task,
		params: Readonly<{
			user: User;
		}>,
	) => {
		const ifUserBelongsToTaskListResult =
			await injected.fetchIfUserBelongsToTaskList(task.taskListSlug, {
				userSlug: params.user.slug,
			});
		if (!ifUserBelongsToTaskListResult.success) {
			throw new UnreachableCase(ifUserBelongsToTaskListResult.success);
		}
		return ifUserBelongsToTaskListResult.value.belongs;
	};
export type IsTaskEditableByUser = ReturnType<typeof isTaskEditableByUser>;
