import { UnreachableCase } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-util";
import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import type { Port } from "@/port";
import {
	issueAccessTokenForUser,
	requireAuthRFC9457ResponseDefinitions,
} from "@/util/auth";
import {
	type InferRFC9457ResponseBodyPerStatus,
	type RFC9457ResponseErrorDefinition,
	rfc9457OpenAPISpecResponses,
} from "@/util/rfc9457";

export const authSessionCreateApp = (
	injected: Port<"authenticateUserWithEmailAndPassword" | "jwtSecret">,
) =>
	new Hono().post(
		"/",
		describeRoute({
			summary: "Create an authentication session",
			description: "Create an authentication session for a user",
			tags: ["auth"],
			responses: {
				200: {
					description: "Authentication session created",
					content: {
						"application/json": {
							schema: resolver(response200JsonSchema),
						},
					},
				},
				...rfc9457OpenAPISpecResponses(rfc9457ResponseDefinitions),
			},
		}),
		validator(
			"json",
			v.object({
				email: v.pipe(
					v.string(),
					v.email(),
					v.description("Email of the user"),
				),
				password: v.pipe(
					v.string(),
					v.minLength(1),
					v.description("Password of the user"),
				),
			}),
		),
		async (c) => {
			const { email, password } = c.req.valid("json");
			const authResult = await injected.authenticateUserWithEmailAndPassword({
				email,
				password,
			});
			if (!authResult.success) {
				switch (authResult.error.kind) {
					case "userWithEmailNotFound":
					case "passwordMismatch": {
						return c.json({
							title: "unauthorized",
							detail: "Invalid email or password",
						} satisfies AuthSessionCreateResponseBodyTypePerStatus["401"]);
					}
					default: {
						throw new UnreachableCase(authResult.error);
					}
				}
			}
			return c.json({
				accessToken: await issueAccessTokenForUser({
					jwtSecret: injected.jwtSecret,
					userSlug: authResult.value.user.slug,
				}),
			} satisfies AuthSessionCreateResponseBodyTypePerStatus["200"]);
		},
	);

const response200JsonSchema = v.object({
	accessToken: v.string(),
});
const rfc9457ResponseDefinitions = [
	...requireAuthRFC9457ResponseDefinitions,
] as const satisfies readonly RFC9457ResponseErrorDefinition[];

export type AuthSessionCreateResponseBodyTypePerStatus =
	InferRFC9457ResponseBodyPerStatus<
		(typeof rfc9457ResponseDefinitions)[number]
	> & {
		200: v.InferOutput<typeof response200JsonSchema>;
	};
