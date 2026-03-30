import type { TaskList } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-domain";
import { UnreachableCase } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-util";
import { Hono } from "hono";
import { html } from "hono/html";
import type { Port } from "@/port";
import { requireAuth } from "@/util/auth";

export const taskListListApp = (
	injected: Parameters<typeof requireAuth>[0] & Port<"fetchTaskListForUser">,
) =>
	new Hono().get("/", requireAuth(injected), async (c) => {
		const currentUserSlug = c.get("currentUserSlug");
		const fetchTaskListForUserResult = await injected.fetchTaskListForUser({
			userSlug: currentUserSlug,
		});
		// For letting us notice when failure result type is defined but not handled
		if (!fetchTaskListForUserResult.success) {
			throw new UnreachableCase(fetchTaskListForUserResult.success);
		}

		return c.html(
			taskListListPage({
				path: c.req.path,
				taskLists: fetchTaskListForUserResult.value.taskLists,
			}),
		);
	});

const taskListListPage = (
	params: Readonly<{
		path: string;
		taskLists: readonly TaskList[];
	}>,
) => html`
<div>
    <a href="/logout">Logout</a>
</div>

<h1>Task Lists</h1>

<div class="actions">
    <a href="${params.path}/new">New Task List</a>
</div>

${
	params.taskLists.length === 0
		? html`<p>No task list</p>`
		: html`<ul>
    ${params.taskLists.map(
			(taskList) => html`<li>
        <a href="${params.path}/${taskList.slug}">${taskList.name}</a>
    </li>`,
		)}
</ul>`
}
`;
