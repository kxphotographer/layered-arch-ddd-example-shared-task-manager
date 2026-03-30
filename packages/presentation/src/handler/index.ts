import { Hono } from "hono";
import { loginApp } from "./login";
import { logoutApp } from "./logout";
import { taskListListApp } from "./task-list/list";

export const rootApp = (
	injected: Parameters<typeof loginApp>[0] &
		Parameters<typeof logoutApp>[0] &
		Parameters<typeof taskListListApp>[0],
) =>
	new Hono()
		.route("/login", loginApp(injected))
		.route("/logout", logoutApp(injected))
		.route("/task-list", taskListListApp(injected));

export type RootAppType = typeof rootApp;
