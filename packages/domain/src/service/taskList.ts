import { UnreachableCase } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-util";
import type { TaskList, User } from "@/entity";
import type { FetchIfUserBelongsToTaskList } from "@/port";

export const isTaskListVisibleToUser =
	(
		injected: Readonly<{
			fetchIfUserBelongsToTaskList: FetchIfUserBelongsToTaskList;
		}>,
	) =>
	async (
		taskList: TaskList,
		params: Readonly<{
			user: User;
		}>,
	) => {
		const ifUserBelongsToTaskListResult =
			await injected.fetchIfUserBelongsToTaskList(taskList.slug, {
				userSlug: params.user.slug,
			});
		if (!ifUserBelongsToTaskListResult.success) {
			throw new UnreachableCase(ifUserBelongsToTaskListResult.success);
		}
		return ifUserBelongsToTaskListResult.value.belongs;
	};
export type IsTaskListVisibleToUser = ReturnType<
	typeof isTaskListVisibleToUser
>;
