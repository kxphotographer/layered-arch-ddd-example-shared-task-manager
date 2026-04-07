import { Hono } from "hono";
import { taskListsTaskListSlugShowApp } from "./show";

export const taskListsTaskListSlugApp = (
	injected: Parameters<typeof taskListsTaskListSlugShowApp>[0],
) => new Hono().route("/", taskListsTaskListSlugShowApp(injected));
