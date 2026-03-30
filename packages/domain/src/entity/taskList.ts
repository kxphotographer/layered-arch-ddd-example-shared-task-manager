import type { Result } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-util";
import * as v from "valibot";
import type { User, UserSlug } from "./user";

const vTaskListSlug = v.pipe(
	v.string(),
	v.minLength(1),
	v.brand("TaskListSlug"),
);
/**
 * Identifier of a {@linkcode TaskList} entity.
 */
export type TaskListSlug = v.InferOutput<typeof vTaskListSlug>;
export type RawTaskListSlug = v.InferInput<typeof vTaskListSlug>;
/**
 * Validates and types a task list slug.
 */
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
/**
 * Schema of a {@linkcode TaskList} entity.
 */
type TaskListSchema = typeof vTaskList;
/**
 * Represents a task list in the system.
 */
export type TaskList = v.InferOutput<TaskListSchema>;
/**
 * Raw input of a {@linkcode TaskList} entity.
 */
export type RawTaskList = v.InferInput<TaskListSchema>;
/**
 * Validates and types a task list.
 */
export const parseTaskList = (input: RawTaskList): TaskList =>
	v.parse(vTaskList, input);

/**
 * Validates and types a task list, returning an error if invalid.
 */
export const safeParseTaskList = (input: RawTaskList) =>
	v.safeParse(vTaskList, input);

/**
 * Creates a new task list.
 */
export const newTaskList = (
	params: Readonly<{
		/**
		 * User who created the task list.
		 */
		createdByUser: User;
		/**
		 * Current date.
		 */
		currentDate: Date;
		/**
		 * Function to generate a unique slug for the task list.
		 */
		generateSlug: () => string;
		/**
		 * Name of the task list.
		 */
		name: string;
	}>,
): Result<
	{
		/**
		 * Created {@linkcode TaskList} entity.
		 */
		taskList: TaskList;
	},
	{
		/**
		 * Created {@linkcode TaskList} entity has invalid values.
		 */
		kind: "validationError";
		issues: v.InferIssue<TaskListSchema>[];
	}
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

/**
 * Checks if a task list has a user.
 */
export const taskListHasUser = (
	/**
	 * {@linkcode TaskList} entity to check if it has a user.
	 */
	taskList: TaskList,
	params: Readonly<{
		/**
		 * User slug to check if the task list has.
		 */
		userSlug: UserSlug;
	}>,
): boolean => taskList.belongingUserSlugs.has(params.userSlug);

/**
 * Adds a user to a task list.
 */
export const addUserToTaskList = (
	/**
	 * {@linkcode TaskList} entity to add a user to.
	 */
	taskList: TaskList,
	params: Readonly<{
		/**
		 * Current date.
		 */
		currentDate: Date;
		/**
		 * User who is adding the user to the task list.
		 */
		currentUserSlug: UserSlug;
		/**
		 * User slug to add to the task list.
		 */
		newUserSlug: UserSlug;
	}>,
): Result<
	{
		/**
		 * {@linkcode TaskList} entity with the user added.
		 */
		taskList: TaskList;
	},
	{
		/**
		 * User who is adding the user to the task list has no permission.
		 */
		kind: "permissionDenied";
	}
> => {
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

/**
 * Removes a user from a task list.
 */
export const removeUserFromTaskList = (
	/**
	 * {@linkcode TaskList} entity to remove a user from.
	 */
	taskList: TaskList,
	params: Readonly<{
		/**
		 * Current date.
		 */
		currentDate: Date;
		/**
		 * User who is removing the user from the task list.
		 */
		currentUserSlug: UserSlug;
		/**
		 * User slug to remove from the task list.
		 */
		removingUserSlug: UserSlug;
	}>,
): Result<
	{
		/**
		 * {@linkcode TaskList} entity with the user removed.
		 */
		taskList: TaskList;
	},
	| {
			/**
			 * User who is removing the user from the task list has no permission.
			 */
			kind: "permissionDenied";
	  }
	| {
			/**
			 * Task list has too few users left.
			 */
			kind: "tooFewUsersLeft";
	  }
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

/**
 * Changes the name of a task list.
 */
export const changeTaskListName = (
	/**
	 * {@linkcode TaskList} entity to change the name of.
	 */
	taskList: TaskList,
	params: Readonly<{
		/**
		 * Current date.
		 */
		currentDate: Date;
		/**
		 * User who is changing the name of the task list.
		 */
		currentUser: User;
		/**
		 * New name of the task list.
		 */
		name: string;
	}>,
): Result<
	{
		/**
		 * Changed {@linkcode TaskList} entity.
		 */
		taskList: TaskList;
	},
	| {
			/**
			 * User who is changing the name of the task list has no permission.
			 */
			kind: "permissionDenied";
	  }
	| {
			/**
			 * Changed {@linkcode TaskList} entity has invalid values.
			 */
			kind: "validationError";
			issues: v.InferIssue<TaskListSchema>[];
	  }
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
