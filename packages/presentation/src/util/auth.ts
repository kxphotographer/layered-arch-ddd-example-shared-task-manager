import {
	type UserSlug,
	vUserSlug,
} from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-domain";
import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { sign, verify } from "hono/jwt";
import * as v from "valibot";
import type { Port } from "@/port";

const COOKIE_ACCESS_TOKEN_NAME = "access_token";
const COOKIE_ACCESS_TOKEN_ALGORITHM = "HS256";

export const setAuthCookieForUser = async (
	c: Context,
	params: Readonly<{
		jwtSecret: string;
		userSlug: UserSlug;
	}>,
) => {
	setCookie(
		c,
		COOKIE_ACCESS_TOKEN_NAME,
		await sign(
			{
				sub: params.userSlug,
				exp: Math.floor(Date.now() / 1000) + 86400, // 1 day
			},
			params.jwtSecret,
			COOKIE_ACCESS_TOKEN_ALGORITHM,
		),
	);
};

export const deleteAuthCookie = (c: Context) => {
	deleteCookie(c, COOKIE_ACCESS_TOKEN_NAME);
};

export const requireAuth = (injected: Port<"jwtSecret">) =>
	createMiddleware<{
		Variables: {
			currentUserSlug: UserSlug;
		};
	}>(async (c, next) => {
		const token = getCookie(c, COOKIE_ACCESS_TOKEN_NAME);
		if (!token) {
			return c.redirect(`/login?redirect_to=${encodeURIComponent(c.req.url)}`);
		}

		const jwtPayload = await verify(
			token,
			injected.jwtSecret,
			COOKIE_ACCESS_TOKEN_ALGORITHM,
		);
		const parseResult = v.safeParse(jwtPayloadSchema, jwtPayload);
		if (!parseResult.success) {
			return c.redirect(`/login?redirect_to=${encodeURIComponent(c.req.url)}`);
		}

		c.set("currentUserSlug", parseResult.output.sub);
		await next();
		return;
	});

const jwtPayloadSchema = v.object({
	exp: v.pipe(v.number(), v.integer()),
	sub: vUserSlug,
});
