import {
	type Result,
	UnreachableCase,
} from "@kxphotographer/layered-arch-ddd-example-shared-task-manager-util";
import type * as v from "valibot";
import {
	parseUserSlug,
	safeParseUser,
	type User,
	type UserSchema,
} from "@/entity";
import type { Port } from "@/port";

export const newUser =
	<Transaction>(
		injected: Port<
			Transaction,
			| "fetchIfUserCredentialEmailAlreadyUsed"
			| "generateSlug"
			| "getCurrentDate"
			| "hashPassword"
		>,
	) =>
	async (
		params: Readonly<{
			name: string;
			email: string;
			password: string;
		}>,
	): Promise<
		Result<
			{
				user: User;
			},
			| {
					kind: "duplicateEmail";
			  }
			| {
					kind: "validationError";
					issues: v.InferIssue<UserSchema>[];
			  }
		>
	> => {
		const duplicateCheckResult =
			await injected.fetchIfUserCredentialEmailAlreadyUsed({
				email: params.email,
			});
		// For letting us notice when failure result type is defined but not handled
		if (!duplicateCheckResult.success) {
			throw new UnreachableCase(duplicateCheckResult.success);
		}

		if (duplicateCheckResult.value.exists) {
			return {
				success: false,
				error: {
					kind: "duplicateEmail",
				},
			};
		}

		const currentDate = injected.getCurrentDate();
		const userParseResult = safeParseUser({
			slug: parseUserSlug(injected.generateSlug()),
			createdAt: currentDate,
			updatedAt: currentDate,
			name: params.name,
			credentials: [
				{
					type: "emailPassword",
					email: params.email,
					passwordHash: await injected.hashPassword(params.password),
				},
			],
		});
		if (!userParseResult.success) {
			return {
				success: false,
				error: {
					kind: "validationError",
					issues: userParseResult.issues,
				},
			};
		}

		return {
			success: true,
			value: {
				user: userParseResult.output,
			},
		};
	};
