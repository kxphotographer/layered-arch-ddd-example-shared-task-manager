import type { Task } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-domain";
import * as v from "valibot";

export const vTaskSummary = v.pipe(
	v.object({
		slug: v.pipe(
			v.string(),
			v.minLength(1),
			v.description("Unique identifier of the task"),
		),
		createdAt: v.pipe(
			v.string(),
			v.isoTimestamp(),
			v.description("Date and time the task was created"),
		),
		updatedAt: v.pipe(
			v.string(),
			v.isoTimestamp(),
			v.description("Date and time the task was last updated"),
		),
		taskListSlug: v.pipe(
			v.string(),
			v.minLength(1),
			v.description("Unique identifier of the task list the task belongs to"),
		),
		assignedToUserSlug: v.pipe(
			v.nullable(v.string()),
			v.description(
				"Unique identifier of the user who is assigned to the task",
			),
		),
		name: v.pipe(
			v.string(),
			v.minLength(1),
			v.maxLength(64),
			v.description("Name of the task"),
		),
		status: v.pipe(
			v.union([v.literal("todo"), v.literal("inProgress"), v.literal("done")]),
			v.description("Status of the task"),
		),
	}),
	v.description("Task summary"),
);

export const taskSummaryResourceFromDomain = (
	task: Task,
): v.InferOutput<typeof vTaskSummary> => ({
	slug: task.slug,
	createdAt: task.createdAt.toISOString(),
	updatedAt: task.updatedAt.toISOString(),
	taskListSlug: task.taskListSlug,
	assignedToUserSlug: task.assignedToUserSlug,
	name: task.name,
	status: task.status,
});
