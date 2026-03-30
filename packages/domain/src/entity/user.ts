import type { Result } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-util";
import * as v from "valibot";

export const vUserSlug = v.pipe(
	v.string(),
	v.minLength(1),
	v.brand("UserSlug"),
);
/**
 * Identifier of a {@linkcode User} entity.
 */
export type UserSlug = v.InferOutput<typeof vUserSlug>;
/**
 * Raw input of a {@linkcode UserSlug}.
 */
export type RawUserSlug = v.InferInput<typeof vUserSlug>;
/**
 * Validates and types a user slug.
 */
export const parseUserSlug = (input: RawUserSlug): UserSlug =>
	v.parse(vUserSlug, input);

const vUser = v.pipe(
	v.object({
		/**
		 * Unique identifier of the user.
		 */
		slug: v.custom<UserSlug>(() => true),
		/**
		 * Date and time the user was created.
		 */
		createdAt: v.date(),
		/**
		 * Date and time the user was last updated.
		 */
		updatedAt: v.date(),
		/**
		 * Name of the user.
		 */
		name: v.pipe(v.string(), v.minLength(1), v.maxLength(64)),
		credentials: v.pipe(
			v.array(
				v.variant("type", [
					v.object({
						type: v.literal("emailPassword"),
						email: v.pipe(v.string(), v.email()),
						passwordHash: v.string(),
					}),
				]),
			),
			v.minLength(1),
		),
	}),
	v.readonly(),
	v.check(
		({ createdAt, updatedAt }) => createdAt <= updatedAt,
		"Must be createdAt <= updatedAt",
	),
	v.brand("User"),
);
export type UserSchema = typeof vUser;
/**
 * Represents a user in the system.
 */
export type User = v.InferOutput<UserSchema>;
/**
 * Raw input of a {@linkcode User} entity.
 */
export type RawUser = v.InferInput<UserSchema>;
/**
 * Validates and types a user.
 */
export const parseUser = (input: RawUser): User => v.parse(vUser, input);
/**
 * Validates and types a user, returning an error if invalid.
 */
export const safeParseUser = (input: RawUser) => v.safeParse(vUser, input);

/**
 * Changes the name of a user.
 */
export const changeUserName = (
	/**
	 * {@linkcode User} entity to change the name of.
	 */
	user: User,
	params: Readonly<{
		/**
		 * Current date.
		 */
		currentDate: Date;

		/**
		 * User who is changing the name of the user.
		 */
		currentUser: User;

		/**
		 * New name of the user.
		 */
		name: string;
	}>,
): Result<
	{
		/**
		 * Changed {@linkcode User} entity.
		 */
		user: User;
	},
	| {
			/**
			 * `currentUser` has no permission to change the name of the user.
			 */
			kind: "permissionDenied";
	  }
	| {
			/**
			 * Changed {@linkcode User} entity has invalid values.
			 */
			kind: "validationError";
			issues: v.InferIssue<UserSchema>[];
	  }
> => {
	if (params.currentUser.slug !== user.slug) {
		return {
			success: false,
			error: {
				kind: "permissionDenied",
			},
		};
	}

	const newUserParseResult = safeParseUser({
		...user,
		updatedAt: params.currentDate,
		name: params.name,
	});
	if (!newUserParseResult.success) {
		return {
			success: false,
			error: {
				kind: "validationError",
				issues: newUserParseResult.issues,
			},
		};
	}

	return {
		success: true,
		value: {
			user: newUserParseResult.output,
		},
	};
};
