import { Hono } from "hono";
import { authSessionCreateApp } from "./create";

export const authSessionApp = (
	injected: Parameters<typeof authSessionCreateApp>[0],
) => new Hono().route("/create", authSessionCreateApp(injected));
