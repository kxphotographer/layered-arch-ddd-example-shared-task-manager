import { parseTaskListSlug } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-domain";
import { UnreachableCase } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-util";
import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import type { Port } from "@/port";
import {
	taskListResourceFromDomain,
	taskSummaryResourceFromDomain,
	userResourceFromDomain,
	vTaskList,
	vTaskSummary,
	vUser,
} from "@/resourceSchema";
import {
	requireAuth,
	requireAuthRFC9457ResponseDefinitions,
} from "@/util/auth";
import {
	type InferRFC9457ResponseBodyPerStatus,
	type RFC9457ResponseErrorDefinition,
	rfc9457OpenAPISpecResponses,
} from "@/util/rfc9457";
import { taskListSlugPathParamSchema } from "./_commonSchema";

export const taskListsTaskListSlugShowApp = (
	injected: Parameters<typeof requireAuth>[0] & Port<"fetchTaskListBySlug">,
) =>
	new Hono().get(
		"/",
		describeRoute({
			summary: "Show a task list",
			description: "Show a task list",
			tags: ["task-list"],
			responses: {
				200: {
					description: "Task list shown",
					content: {
						"application/json": {
							schema: resolver(response200JsonSchema),
						},
					},
				},
				...rfc9457OpenAPISpecResponses(rfc9457ResponseDefinitions),
			},
		}),
		validator("param", v.object({ ...taskListSlugPathParamSchema })),
		requireAuth(injected),
		async (c) => {
			const currentUserSlug = c.get("currentUserSlug");
			const { taskListSlug } = c.req.valid("param");
			const fetchTaskListBySlugResult = await injected.fetchTaskListBySlug({
				currentUserSlug,
				taskListSlug: parseTaskListSlug(taskListSlug),
			});
			if (!fetchTaskListBySlugResult.success) {
				switch (fetchTaskListBySlugResult.error.kind) {
					case "notFound": {
						return c.json(
							{
								title: "taskListNotFound",
								detail: "Task list not found",
							} satisfies TaskListsShowResponseBodyTypePerStatus["404"],
							404,
						);
					}
					case "permissionDenied": {
						return c.json(
							{
								title: "permissionDenied",
								detail: "You do not have permission to access this task list",
							} satisfies TaskListsShowResponseBodyTypePerStatus["403"],
							403,
						);
					}
					default: {
						throw new UnreachableCase(fetchTaskListBySlugResult.error);
					}
				}
			}

			return c.json({
				taskList: taskListResourceFromDomain(
					fetchTaskListBySlugResult.value.taskList,
				),
				tasks: fetchTaskListBySlugResult.value.tasks.map(
					taskSummaryResourceFromDomain,
				),
				users: fetchTaskListBySlugResult.value.users.map(
					userResourceFromDomain,
				),
			} satisfies TaskListsShowResponseBodyTypePerStatus["200"]);
		},
	);

const response200JsonSchema = v.object({
	taskList: vTaskList,
	tasks: v.array(vTaskSummary),
	users: v.array(vUser),
});

const rfc9457ResponseDefinitions = [
	...requireAuthRFC9457ResponseDefinitions,
	{
		status: 404,
		title: "taskListNotFound",
		description: "Task list not found",
	},
	{
		status: 403,
		title: "permissionDenied",
		description: "You do not have permission to access this task list",
	},
] as const satisfies readonly RFC9457ResponseErrorDefinition[];

export type TaskListsShowResponseBodyTypePerStatus =
	InferRFC9457ResponseBodyPerStatus<
		(typeof rfc9457ResponseDefinitions)[number]
	> & {
		200: v.InferOutput<typeof response200JsonSchema>;
	};
