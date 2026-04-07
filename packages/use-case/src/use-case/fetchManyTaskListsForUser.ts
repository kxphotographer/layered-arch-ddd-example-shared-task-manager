import type { FetchManyTaskListsForUser } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-presentation";
import { UnreachableCase } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-util";
import type { Port } from "@/port";

export const fetchManyTaskListsForUser =
	<Transaction>(
		injected: Port<Transaction, "fetchManyTaskListsForUser">,
	): FetchManyTaskListsForUser =>
	async (params) => {
		const taskListsFetchResult =
			await injected.fetchManyTaskListsForUser(params);
		if (!taskListsFetchResult.success) {
			throw new UnreachableCase(taskListsFetchResult.success);
		}

		return {
			success: true,
			value: {
				taskLists: taskListsFetchResult.value.taskLists,
			},
		};
	};
