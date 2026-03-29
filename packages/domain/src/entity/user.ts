import type { Result } from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-util";
import * as v from "valibot";

const vUserSlug = v.pipe(v.string(), v.minLength(1), v.brand("UserSlug"));
export type UserSlug = v.InferOutput<typeof vUserSlug>;
export type RawUserSlug = v.InferInput<typeof vUserSlug>;
export const parseUserSlug = (input: RawUserSlug): UserSlug =>
	v.parse(vUserSlug, input);

const vUser = v.pipe(
	v.object({
		slug: v.custom<UserSlug>(() => true),
		createdAt: v.date(),
		updatedAt: v.date(),
		name: v.pipe(v.string(), v.minLength(1), v.maxLength(64)),
	}),
	v.readonly(),
	v.check(
		({ createdAt, updatedAt }) => createdAt <= updatedAt,
		"Must be createdAt <= updatedAt",
	),
	v.brand("User"),
);
type UserSchema = typeof vUser;
export type User = v.InferOutput<UserSchema>;
export type RawUser = v.InferInput<UserSchema>;
export const parseUser = (input: RawUser): User => v.parse(vUser, input);
export const safeParseUser = (input: RawUser) => v.safeParse(vUser, input);

export const changeUserName = (
	user: User,
	params: Readonly<{
		currentDate: Date;
		currentUser: User;
		name: string;
	}>,
): Result<
	{ user: User },
	| { kind: "permissionDenied" }
	| { kind: "validationError"; issues: v.InferIssue<UserSchema>[] }
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
