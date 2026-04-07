import {
	type UserSlug,
	vUserSlug,
} from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-domain";
import { createMiddleware } from "hono/factory";
import { sign, verify } from "hono/jwt";
import * as v from "valibot";
import type { Port } from "@/port";
import type {
	InferRFC9457ResponseBodyPerStatus,
	RFC9457ResponseErrorDefinition,
} from "./rfc9457";

const COOKIE_ACCESS_TOKEN_ALGORITHM = "HS256";

export const issueAccessTokenForUser = async (
	params: Readonly<{
		jwtSecret: string;
		userSlug: UserSlug;
	}>,
) =>
	await sign(
		{
			sub: params.userSlug,
			exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
		} satisfies v.InferInput<typeof jwtPayloadSchema>,
		params.jwtSecret,
		COOKIE_ACCESS_TOKEN_ALGORITHM,
	);

export const requireAuth = (injected: Port<"jwtSecret">) =>
	createMiddleware<{
		Variables: {
			currentUserSlug: UserSlug;
		};
	}>(async (c, next) => {
		const authHeader = c.req.header("Authorization");
		if (!authHeader) {
			return c.json(
				{
					title: "unauthorized",
					detail: "Unauthorized",
				} satisfies InferRFC9457ResponseBodyPerStatus<
					(typeof requireAuthRFC9457ResponseDefinitions)[number]
				>[401],
				401,
			);
		}

		const [scheme, token] = authHeader.split(" ");
		if (scheme !== "Bearer" || !token) {
			return c.json(
				{
					title: "unauthorized",
					detail: "Unauthorized",
				} satisfies InferRFC9457ResponseBodyPerStatus<
					(typeof requireAuthRFC9457ResponseDefinitions)[number]
				>[401],
				401,
			);
		}

		const jwtPayload = await verify(
			token,
			injected.jwtSecret,
			COOKIE_ACCESS_TOKEN_ALGORITHM,
		);
		const parseResult = v.safeParse(jwtPayloadSchema, jwtPayload);
		if (!parseResult.success) {
			return c.json(
				{
					title: "unauthorized",
					detail: "Unauthorized",
				} satisfies InferRFC9457ResponseBodyPerStatus<
					(typeof requireAuthRFC9457ResponseDefinitions)[number]
				>[401],
				401,
			);
		}

		c.set("currentUserSlug", parseResult.output.sub);
		await next();
		return;
	});

const jwtPayloadSchema = v.object({
	exp: v.pipe(v.number(), v.integer()),
	sub: vUserSlug,
});

export const requireAuthRFC9457ResponseDefinitions = [
	{
		status: 401,
		title: "unauthorized",
		description: "Unauthorized",
	},
] as const satisfies readonly RFC9457ResponseErrorDefinition[];
