import type { Result } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-util";
import type { Task, TaskList } from "@/entity";

export type FetchBelongingTaskListOfTask = (
	task: Task,
) => Promise<Result<{ taskList: TaskList }, { kind: "notFound" }>>;
