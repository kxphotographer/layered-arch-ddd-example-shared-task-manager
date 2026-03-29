import type { Result } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-util";
import * as v from "valibot";
import type { User, UserSlug } from "./user";

const vTaskListSlug = v.pipe(
	v.string(),
	v.minLength(1),
	v.brand("TaskListSlug"),
);
export type TaskListSlug = v.InferOutput<typeof vTaskListSlug>;
export type RawTaskListSlug = v.InferInput<typeof vTaskListSlug>;
export const parseTaskListSlug = (input: RawTaskListSlug): TaskListSlug =>
	v.parse(vTaskListSlug, input);

const vTaskList = v.pipe(
	v.object({
		slug: v.custom<TaskListSlug>(() => true),
		createdAt: v.date(),
		updatedAt: v.date(),
		createdByUserSlug: v.custom<UserSlug>(() => true),
		name: v.pipe(v.string(), v.minLength(1), v.maxLength(64)),
		belongingUserSlugs: v.custom<ReadonlySet<UserSlug>>(
			(value) => value instanceof Set && 1 <= value.size,
			"belongingUserSlugs must be a set with at least one user slug",
		),
	}),
	v.readonly(),
	v.check(
		({ createdAt, updatedAt }) => createdAt <= updatedAt,
		"Must be createdAt <= updatedAt",
	),
	v.brand("TaskList"),
);
type TaskListSchema = typeof vTaskList;
export type TaskList = v.InferOutput<TaskListSchema>;
export type RawTaskList = v.InferInput<TaskListSchema>;
export const parseTaskList = (input: RawTaskList): TaskList =>
	v.parse(vTaskList, input);
export const safeParseTaskList = (input: RawTaskList) =>
	v.safeParse(vTaskList, input);

export const newTaskList = (
	params: Readonly<{
		createdByUser: User;
		currentDate: Date;
		generateSlug: () => string;
		name: string;
	}>,
): Result<
	{ taskList: TaskList },
	{ kind: "validationError"; issues: v.InferIssue<TaskListSchema>[] }
> => {
	const result = safeParseTaskList({
		slug: parseTaskListSlug(params.generateSlug()),
		createdAt: params.currentDate,
		updatedAt: params.currentDate,
		createdByUserSlug: params.createdByUser.slug,
		name: params.name,
		belongingUserSlugs: new Set([params.createdByUser.slug]),
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
			taskList: result.output,
		},
	};
};

export const taskListHasUser = (
	taskList: TaskList,
	params: Readonly<{
		userSlug: UserSlug;
	}>,
): boolean => taskList.belongingUserSlugs.has(params.userSlug);

export const addUserToTaskList = (
	taskList: TaskList,
	params: Readonly<{
		currentDate: Date;
		currentUserSlug: UserSlug;
		newUserSlug: UserSlug;
	}>,
): Result<{ taskList: TaskList }, { kind: "permissionDenied" }> => {
	if (!taskListHasUser(taskList, { userSlug: params.newUserSlug })) {
		return {
			success: false,
			error: {
				kind: "permissionDenied",
			},
		};
	}

	return {
		success: true,
		value: {
			taskList: parseTaskList({
				...taskList,
				updatedAt: params.currentDate,
				belongingUserSlugs: new Set([
					...taskList.belongingUserSlugs,
					params.newUserSlug,
				]),
			}),
		},
	};
};

export const removeUserFromTaskList = (
	taskList: TaskList,
	params: Readonly<{
		currentDate: Date;
		currentUserSlug: UserSlug;
		removingUserSlug: UserSlug;
	}>,
): Result<
	{ taskList: TaskList },
	{ kind: "permissionDenied" } | { kind: "tooFewUsersLeft" }
> => {
	if (!taskListHasUser(taskList, { userSlug: params.removingUserSlug })) {
		return {
			success: false,
			error: {
				kind: "permissionDenied",
			},
		};
	}

	if (taskList.belongingUserSlugs.size === 1) {
		return {
			success: false,
			error: {
				kind: "tooFewUsersLeft",
			},
		};
	}

	return {
		success: true,
		value: {
			taskList: parseTaskList({
				...taskList,
				updatedAt: params.currentDate,
				belongingUserSlugs: taskList.belongingUserSlugs.difference(
					new Set([params.removingUserSlug]),
				),
			}),
		},
	};
};

export const changeTaskListName = (
	taskList: TaskList,
	params: Readonly<{
		currentDate: Date;
		currentUser: User;
		name: string;
	}>,
): Result<
	{ taskList: TaskList },
	| { kind: "permissionDenied" }
	| { kind: "validationError"; issues: v.InferIssue<TaskListSchema>[] }
> => {
	if (params.currentUser.slug !== taskList.createdByUserSlug) {
		return {
			success: false,
			error: {
				kind: "permissionDenied",
			},
		};
	}

	const newTaskListParseResult = safeParseTaskList({
		...taskList,
		updatedAt: params.currentDate,
		name: params.name,
	});
	if (!newTaskListParseResult.success) {
		return {
			success: false,
			error: {
				kind: "validationError",
				issues: newTaskListParseResult.issues,
			},
		};
	}
	return {
		success: true,
		value: {
			taskList: newTaskListParseResult.output,
		},
	};
};
