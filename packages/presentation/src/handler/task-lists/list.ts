import { UnreachableCase } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-util";
import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import * as v from "valibot";
import type { Port } from "@/port";
import { vTaskList, vUser } from "@/resourceSchema";
import {
	requireAuth,
	requireAuthRFC9457ResponseDefinitions,
} from "@/util/auth";
import {
	type InferRFC9457ResponseBodyPerStatus,
	type RFC9457ResponseErrorDefinition,
	rfc9457OpenAPISpecResponses,
} from "@/util/rfc9457";

export const taskListsListApp = (
	injected: Parameters<typeof requireAuth>[0] &
		Port<"fetchManyTaskListsForUser">,
) =>
	new Hono().get(
		"/",
		describeRoute({
			summary: "List task lists",
			description: "List task lists",
			tags: ["task-list"],
			responses: {
				200: {
					description: "Task lists listed",
					content: {
						"application/json": {
							schema: resolver(response200JsonSchema),
						},
					},
				},
				...rfc9457OpenAPISpecResponses(rfc9457ResponseDefinitions),
			},
		}),
		requireAuth(injected),
		async (c) => {
			const currentUserSlug = c.get("currentUserSlug");
			const fetchManyTaskListsForUserResult =
				await injected.fetchManyTaskListsForUser({
					userSlug: currentUserSlug,
				});
			// For letting us notice when failure result type is defined but not handled
			if (!fetchManyTaskListsForUserResult.success) {
				throw new UnreachableCase(fetchManyTaskListsForUserResult.success);
			}

			return c.json({
				taskLists: fetchManyTaskListsForUserResult.value.taskLists.map(
					(taskList) => ({ taskList }),
				),
			});
		},
	);

const response200JsonSchema = v.object({
	taskLists: v.array(v.object({ taskList: vTaskList, createdByUser: vUser })),
});
const rfc9457ResponseDefinitions = [
	...requireAuthRFC9457ResponseDefinitions,
] as const satisfies readonly RFC9457ResponseErrorDefinition[];

export type TaskListsListResponseBodyTypePerStatus =
	InferRFC9457ResponseBodyPerStatus<
		(typeof rfc9457ResponseDefinitions)[number]
	> & {
		200: v.InferOutput<typeof response200JsonSchema>;
	};
