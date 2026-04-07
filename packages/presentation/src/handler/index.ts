import { Hono } from "hono";
import { authSessionApp as authSessionsApp } from "./auth-session";
import { taskListsApp } from "./task-lists";
import type { taskListsListApp } from "./task-lists/list";

export const rootApp = (
	injected: Parameters<typeof authSessionsApp>[0] &
		Parameters<typeof taskListsListApp>[0],
) =>
	new Hono()
		.route("/auth-sessions", authSessionsApp(injected))
		.route("/task-lists", taskListsApp(injected));

export type RootAppType = typeof rootApp;
