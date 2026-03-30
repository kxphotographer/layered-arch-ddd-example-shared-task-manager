import * as v from "valibot";
import type { Result } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-util";
import type { TaskListSlug } from "./taskList";
import type { UserSlug } from "./user";

const vTaskSlug = v.pipe(v.string(), v.minLength(1), v.brand("TaskSlug"));
/**
 * Identifier of a {@linkcode Task} entity.
 */
export type TaskSlug = v.InferOutput<typeof vTaskSlug>;
/**
 * Raw input of a {@linkcode TaskSlug}.
 */
export type RawTaskSlug = v.InferInput<typeof vTaskSlug>;
/**
 * Validates and types a task slug.
 */
export const parseTaskSlug = (input: RawTaskSlug): TaskSlug =>
	v.parse(vTaskSlug, input);

const vTask = v.pipe(
	v.object({
		slug: v.custom<TaskSlug>(() => true),
		createdAt: v.date(),
		updatedAt: v.date(),
		taskListSlug: v.custom<TaskListSlug>(() => true),
		createdByUserSlug: v.custom<UserSlug>(() => true),
		assignedToUserSlug: v.nullable(v.custom<UserSlug>(() => true)),
		name: v.pipe(v.string(), v.minLength(1), v.maxLength(64)),
		description: v.string(),
		status: v.union([
			v.literal("todo"),
			v.literal("inProgress"),
			v.literal("done"),
		]),
	}),
	v.readonly(),
	v.check(
		({ createdAt, updatedAt }) => createdAt <= updatedAt,
		"Must be createdAt <= updatedAt",
	),
	v.brand("Task"),
);
type TaskSchema = typeof vTask;
/**
 * {@linkcode Task} entity.
 */
export type Task = v.InferOutput<TaskSchema>;
/**
 * Raw input of a {@linkcode Task}.
 */
export type RawTask = v.InferInput<TaskSchema>;
/**
 * Validates and types a task.
 */
export const parseTask = (input: RawTask): Task => v.parse(vTask, input);
/**
 * Safely validates and types a task.
 */
export const safeParseTask = (input: RawTask) => v.safeParse(vTask, input);

/**
 * Creates a new task.
 */
export const newTask = (
	params: Readonly<{
		currentDate: Date;
		currentUserSlug: UserSlug;
		description: string;
		generateSlug: () => string;
		name: string;
		taskListSlug: TaskListSlug;
	}>,
) =>
	safeParseTask({
		slug: parseTaskSlug(params.generateSlug()),
		createdAt: params.currentDate,
		updatedAt: params.currentDate,
		taskListSlug: params.taskListSlug,
		createdByUserSlug: params.currentUserSlug,
		assignedToUserSlug: null,
		name: params.name,
		description: params.description,
		status: "todo",
	});

export const assignUserToTask = (
	task: Task,
	params: Readonly<{
		currentDate: Date;
		currentUserSlug: UserSlug;
		assignedToUserSlug: UserSlug;
	}>,
): Result<
	{
		task: Task;
	},
	| {
			kind: "permissionDenied";
	  }
	| {
			kind: "validationError";
			issues: v.InferIssue<TaskSchema>[];
	  }
> => {
	if (params.currentUserSlug !== task.createdByUserSlug) {
		return {
			success: false,
			error: {
				kind: "permissionDenied",
			},
		};
	}

	const result = safeParseTask({
		...task,
		updatedAt: params.currentDate,
		assignedToUserSlug: params.assignedToUserSlug,
	});
	if (!result.success) {
		return {
			success: false,
			error: {
				kind: "validationError",
				issues: result.issues,
			},
		};
	}

	return {
		success: true,
		value: {
			task: result.output,
		},
	};
};
