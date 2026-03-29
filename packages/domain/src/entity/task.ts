import * as v from "valibot";
import type { TaskListSlug } from "./taskList";
import type { UserSlug } from "./user";

const vTaskSlug = v.pipe(v.string(), v.minLength(1), v.brand("TaskSlug"));
export type TaskSlug = v.InferOutput<typeof vTaskSlug>;
export type RawTaskSlug = v.InferInput<typeof vTaskSlug>;
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
export type Task = v.InferOutput<TaskSchema>;
export type RawTask = v.InferInput<TaskSchema>;
export const parseTask = (input: RawTask): Task => v.parse(vTask, input);
export const safeParseTask = (input: RawTask) => v.safeParse(vTask, input);
