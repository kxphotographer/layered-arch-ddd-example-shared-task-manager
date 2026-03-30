import { Hono } from "hono";
import type { Port } from "@/port";
import { deleteAuthCookie } from "@/util/auth";

export const logoutApp = (_injected: Port<never>) =>
	new Hono().post("/", async (c) => {
		deleteAuthCookie(c);
		return c.redirect("/login");
	});
