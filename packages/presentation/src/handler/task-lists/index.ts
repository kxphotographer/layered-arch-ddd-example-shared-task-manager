import { Hono } from "hono";
import { taskListsListApp } from "./list";

export const taskListsApp = (
	injected: Parameters<typeof taskListsListApp>[0],
) => new Hono().route("/", taskListsListApp(injected));
