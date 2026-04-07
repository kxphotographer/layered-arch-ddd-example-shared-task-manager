import type { TaskList } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-domain";
import * as v from "valibot";

export const vTaskList = v.pipe(
	v.object({
		slug: v.pipe(
			v.string(),
			v.minLength(1),
			v.description("Unique identifier of the task list"),
		),
		createdAt: v.pipe(
			v.string(),
			v.isoTimestamp(),
			v.description("Date and time the task list was created"),
		),
		updatedAt: v.pipe(
			v.string(),
			v.isoTimestamp(),
			v.description("Date and time the task list was last updated"),
		),
		createdByUserSlug: v.pipe(
			v.string(),
			v.minLength(1),
			v.description("Unique identifier of the user who created the task list"),
		),
		name: v.pipe(
			v.string(),
			v.minLength(1),
			v.maxLength(64),
			v.description("Name of the task list"),
		),
	}),
	v.description("Task list"),
);

export const taskListResourceFromDomain = (
	taskList: TaskList,
): v.InferOutput<typeof vTaskList> => ({
	slug: taskList.slug,
	createdAt: taskList.createdAt.toISOString(),
	updatedAt: taskList.updatedAt.toISOString(),
	createdByUserSlug: taskList.createdByUserSlug,
	name: taskList.name,
});
