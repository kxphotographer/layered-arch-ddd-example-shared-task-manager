import type { User } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-domain";
import * as v from "valibot";

export const vUser = v.pipe(
	v.object({
		slug: v.pipe(
			v.string(),
			v.minLength(1),
			v.description("Unique identifier of the user"),
		),
		createdAt: v.pipe(
			v.string(),
			v.isoTimestamp(),
			v.description("Date and time the user was created"),
		),
		updatedAt: v.pipe(
			v.string(),
			v.isoTimestamp(),
			v.description("Date and time the user was last updated"),
		),
		name: v.pipe(
			v.string(),
			v.minLength(1),
			v.maxLength(64),
			v.description("Name of the user"),
		),
	}),
	v.description("User"),
);

export const userResourceFromDomain = (
	user: User,
): v.InferOutput<typeof vUser> => ({
	slug: user.slug,
	createdAt: user.createdAt.toISOString(),
	updatedAt: user.updatedAt.toISOString(),
	name: user.name,
});
